"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface VoiceRecorderProps {
  onTranscribed: (text: string, durationMs: number, voiceUrl: string) => void;
  disabled?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
declare const webkitSpeechRecognition: new () => SpeechRecognitionInstance;
declare const SpeechRecognition: new () => SpeechRecognitionInstance;

export function VoiceRecorder({ onTranscribed, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [supported, setSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const startTimeRef = useRef<number>(0);
  const transcriptRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupported(
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window,
    );
  }, []);

  const startRecording = () => {
    const Ctor =
      typeof SpeechRecognition !== "undefined"
        ? SpeechRecognition
        : typeof webkitSpeechRecognition !== "undefined"
          ? webkitSpeechRecognition
          : null;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.continuous = true;

    transcriptRef.current = "";
    startTimeRef.current = Date.now();

    recognition.onresult = (e) => {
      transcriptRef.current = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => {
      const durationMs = Date.now() - startTimeRef.current;
      if (transcriptRef.current.trim()) {
        onTranscribed(transcriptRef.current.trim(), durationMs, "");
      }
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => recognitionRef.current?.stop();

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={isRecording ? stopRecording : startRecording}
      className={[
        "rounded-full w-12 h-12 transition-all",
        isRecording
          ? "bg-rose-500 hover:bg-rose-600 animate-pulse"
          : "bg-white/10 hover:bg-white/20",
      ].join(" ")}
    >
      {isRecording ? (
        <Square className="w-5 h-5 text-white fill-white" />
      ) : (
        <Mic className="w-5 h-5 text-white" />
      )}
    </Button>
  );
}
