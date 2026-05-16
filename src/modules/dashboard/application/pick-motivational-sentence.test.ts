import { describe, expect, it, vi } from "vitest";

import type { SentenceRepository } from "../domain/sentence-repository";
import { pickMotivationalSentence } from "./pick-motivational-sentence";

const makeSentence = (text: string, used = false) => ({
  $typeName: "modules.dashboard.proto.v1.Sentence" as const,
  id: crypto.randomUUID(),
  text,
  lastUsedAt: used ? { seconds: 1000n, nanos: 0 } : undefined,
});

describe("pickMotivationalSentence", () => {
  it("returns null when there are no sentences", async () => {
    const sentences: SentenceRepository = { sample: vi.fn().mockResolvedValue([]) };
    expect(await pickMotivationalSentence({ sentences })).toBeNull();
  });

  it("returns the text of a fresh sentence", async () => {
    const s = makeSentence("Keep going.");
    const sentences: SentenceRepository = { sample: vi.fn().mockResolvedValue([s]) };
    expect(await pickMotivationalSentence({ sentences })).toBe("Keep going.");
  });

  it("prefers fresh (unused) sentences over used ones", async () => {
    const used = makeSentence("Old quote.", true);
    const fresh = makeSentence("New quote.");
    const sentences: SentenceRepository = {
      sample: vi.fn().mockResolvedValue([used, fresh]),
    };

    // Run many times — should always pick the fresh one when it's the only unused.
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add((await pickMotivationalSentence({ sentences }))!);
    }
    expect(results.has("New quote.")).toBe(true);
    expect(results.has("Old quote.")).toBe(false);
  });

  it("falls back to any sentence when all are used", async () => {
    const s1 = makeSentence("Quote A.", true);
    const s2 = makeSentence("Quote B.", true);
    const sentences: SentenceRepository = { sample: vi.fn().mockResolvedValue([s1, s2]) };
    const result = await pickMotivationalSentence({ sentences });
    expect(["Quote A.", "Quote B."]).toContain(result);
  });
});
