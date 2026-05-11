"use client";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { ArrowRight, Loader2, SkipForward } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import type { AnswerQuestionResult } from "../application/answer-question";
import type { Question } from "../proto/v1/question_pb";
import { answerQuestionAction } from "./actions";
import { VoiceRecorder } from "./voice-recorder";

interface QuestionCardProps {
  question: Question;
  sessionId: string;
  onAnswer: (result: AnswerQuestionResult) => void;
  onError: (message: string, code?: string) => void;
}

export function QuestionCard({
  question,
  sessionId,
  onAnswer,
  onError,
}: QuestionCardProps) {
  const t = useTranslations();
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (skipped = false) => {
    startTransition(async () => {
      const result = await answerQuestionAction({
        sessionId,
        questionId: question.id,
        text: skipped ? undefined : text,
        skipped,
      });
      if (result.ok) {
        setText("");
        onAnswer(result.data);
      } else {
        onError(result.message, result.code);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-serif text-white leading-snug">
        {question.prompt}
      </h2>

      {question.placeholder && (
        <p className="text-white/40 text-sm italic">{question.placeholder}</p>
      )}

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("pages.discovery.question.placeholder")}
          className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none pr-16"
          disabled={isPending}
        />
        <div className="absolute bottom-3 right-3">
          <VoiceRecorder
            disabled={isPending}
            onTranscribed={(t) =>
              setText((prev) => (prev ? `${prev} ${t}` : t))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-white/40"
          onClick={() => submit(true)}
          disabled={isPending}
        >
          <SkipForward className="w-4 h-4 mr-1" />
          {t("pages.discovery.question.skip")}
        </Button>

        <Button
          onClick={() => submit(false)}
          disabled={isPending || !text.trim()}
          className="bg-white text-black hover:bg-white/90 gap-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {t("pages.discovery.question.continue")}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {question.followUpHint && (
        <p className="text-white/30 text-xs">{question.followUpHint}</p>
      )}
    </div>
  );
}
