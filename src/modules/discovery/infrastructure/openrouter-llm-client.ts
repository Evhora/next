import OpenAI from "openai";
import { create } from "@bufbuild/protobuf";
import { z } from "zod";

import { SynthesisFailedError } from "../domain/errors";
import type { LlmClient, RoutingDecision } from "../domain/llm-client";
import type { Answer, DreamCandidate } from "../proto/v1/session_pb";
import { DreamCandidateSchema, EvidenceQuoteSchema, Phase } from "../proto/v1/session_pb";

const PHASE_NAMES: Record<number, string> = {
  [Phase.CHILDHOOD]: "Infância",
  [Phase.ENVY]: "Inveja",
  [Phase.ENERGY]: "Energia",
  [Phase.MONEY]: "Dinheiro",
  [Phase.PAIN]: "Dor",
  [Phase.DEATH]: "Morte",
};

// Override via env. Default is a free-tier model on OpenRouter — accounts
// without credits MUST use a `:free` slug. Free models generally don't
// support `response_format: json_object`, so we parse JSON best-effort
// via extractJson() and rely on a retry + deterministic fallback.
const SYNTHESIS_MODEL =
  process.env.OPENROUTER_SYNTHESIS_MODEL ??
  "meta-llama/llama-3.3-70b-instruct:free";

const SYNTHESIS_SYSTEM_PROMPT = `Você é um coach de vida especializado em identificar sonhos profundos e autênticos.

IMPORTANTE: Sua resposta deve ser EXCLUSIVAMENTE um objeto JSON válido. Não inclua texto introdutório, explicações, comentários, markdown, blocos de código (\`\`\`), ou qualquer caractere antes do "{" inicial ou depois do "}" final. Comece a resposta com "{" e termine com "}".

Analise as respostas do usuário e retorne EXATAMENTE este JSON:

{
  "candidates": [
    {
      "title": "Título curto e inspirador",
      "description": "Descrição concreta de 2-3 frases",
      "area_of_life": 1,
      "confidence": 0.85,
      "pattern_summary": "Padrão identificado nas respostas",
      "evidence": [
        {
          "question_id": "id-da-pergunta",
          "user_quote": "trecho exato da resposta do usuário",
          "why_relevant": "por que isso aponta para este sonho"
        }
      ]
    }
  ]
}

Regras:
- Retorne exatamente 3 candidatos
- user_quote deve ser substring EXATA de uma resposta do usuário
- area_of_life: 1=Família, 2=Saúde, 3=Negócios, 4=Espiritualidade, 5=Estilo de Vida
- confidence entre 0 e 1
- Pelo menos 3 fases diferentes representadas nas evidências coletivamente`;

const evidenceSchema = z.object({
  question_id: z.string().min(1),
  user_quote: z.string().min(1),
  why_relevant: z.string().min(1),
});

const candidateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  // Accept 0..5; UNSPECIFIED (0) is clamped to a selectable area at build time
  // so a single bad value doesn't throw out the entire LLM response.
  area_of_life: z.number().int().min(0).max(5),
  confidence: z.number().min(0).max(1),
  pattern_summary: z.string().min(1),
  evidence: z.array(evidenceSchema).min(1),
});

const responseSchema = z.object({
  candidates: z.array(candidateSchema).min(1),
});

export class OpenRouterLlmClient implements LlmClient {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://evhora.app",
        "X-Title": "Evhora",
      },
    });
  }

  async nextQuestionHint(): Promise<RoutingDecision> {
    // Routing is handled locally in the application layer (no LLM call).
    return { action: "deeper" };
  }

  async synthesize(answers: Answer[]): Promise<DreamCandidate[]> {
    const usable = answers.filter((a) => !a.skipped && a.text);
    const answersText = usable
      .map(
        (a) =>
          `ID: ${a.questionId}\nFase: ${PHASE_NAMES[a.phase] ?? "?"}\nPergunta: ${a.questionText}\nResposta: ${a.text}`,
      )
      .join("\n\n---\n\n");

    const answerMap = new Map(answers.map((a) => [a.questionId, a]));

    try {
      const parsed = await this.callAndParse(answersText);
      return buildCandidates(parsed.candidates, answerMap);
    } catch (e1) {
      console.error("[discovery] synthesis attempt 1 failed:", e1);
      try {
        const parsed = await this.callAndParse(answersText);
        return buildCandidates(parsed.candidates, answerMap);
      } catch (e2) {
        console.error(
          "[discovery] synthesis attempt 2 failed — using deterministic fallback:",
          e2,
        );
        return deterministicFallback(usable);
      }
    }
  }

  private async callAndParse(
    answersText: string,
  ): Promise<z.infer<typeof responseSchema>> {
    // Note: no `response_format` — many free OpenRouter models don't support
    // JSON mode and will 400 if it's sent. We rely on prompt + extractJson.
    const response = await this.client.chat.completions.create({
      model: SYNTHESIS_MODEL,
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYNTHESIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analise e retorne APENAS o JSON puro (sem markdown, sem texto antes ou depois) com os 3 candidatos de sonho:\n\n${answersText}`,
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    const json = extractJson(text);
    if (!json) {
      console.error(
        "[discovery] could not extract JSON from model output. Raw (truncated):",
        text.slice(0, 800),
      );
      throw new SynthesisFailedError("Could not parse JSON");
    }
    const result = responseSchema.safeParse(json);
    if (!result.success) {
      throw new SynthesisFailedError("Schema validation failed");
    }
    return result.data;
  }
}

const extractJson = (text: string): unknown => {
  const trimmed = text.trim();

  // 1) Try direct parse.
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }

  // 2) Strip markdown code fences if present.
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      // fall through
    }
  }

  // 3) Scan for the first balanced {...} block — robust to preamble/postamble
  //    and to embedded braces inside strings.
  const start = trimmed.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const candidate = trimmed.slice(start, i + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
};

const SELECTABLE_AREAS = new Set([1, 2, 3, 4, 5]);
const clampArea = (n: number): number =>
  SELECTABLE_AREAS.has(n) ? n : 5; // LIFESTYLE default

const buildCandidates = (
  raw: z.infer<typeof candidateSchema>[],
  answerMap: Map<string, Answer>,
): DreamCandidate[] =>
  raw.map((c) =>
    create(DreamCandidateSchema, {
      id: crypto.randomUUID(),
      title: c.title,
      description: c.description,
      areaOfLife: clampArea(c.area_of_life),
      confidence: c.confidence,
      patternSummary: c.pattern_summary,
      evidence: c.evidence.map((ev) => {
        const answer = answerMap.get(ev.question_id);
        const validQuote =
          answer && answer.text.includes(ev.user_quote)
            ? ev.user_quote
            : (answer?.text.slice(0, 120) ?? ev.user_quote);
        return create(EvidenceQuoteSchema, {
          questionId: ev.question_id,
          phase: answer?.phase ?? Phase.UNSPECIFIED,
          userQuote: validQuote,
          whyRelevant: ev.why_relevant,
        });
      }),
    }),
  );

const deterministicFallback = (answers: Answer[]): DreamCandidate[] => {
  // Group answers by phase, pick top 3 most-represented phases.
  const byPhase = new Map<number, Answer[]>();
  for (const a of answers) {
    const list = byPhase.get(a.phase) ?? [];
    list.push(a);
    byPhase.set(a.phase, list);
  }
  const topPhases = [...byPhase.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

  return topPhases.map(([phase, phaseAnswers]) => {
    const phaseName = PHASE_NAMES[phase] ?? "Sonho";
    const first = phaseAnswers[0];
    return create(DreamCandidateSchema, {
      id: crypto.randomUUID(),
      title: `Sonho de ${phaseName}`,
      description: first.text.slice(0, 200),
      areaOfLife: 5, // LIFESTYLE — safe default within selectable range.
      confidence: 0.5,
      patternSummary: `Padrão emergente da fase ${phaseName}`,
      evidence: phaseAnswers.slice(0, 2).map((a) =>
        create(EvidenceQuoteSchema, {
          questionId: a.questionId,
          phase: a.phase,
          userQuote: a.text.slice(0, 120),
          whyRelevant: "Resposta significativa nesta fase",
        }),
      ),
    });
  });
};
