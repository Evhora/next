import OpenAI, { toFile } from "openai";

import type { ServerSupabaseClient } from "@/shared/supabase/types";

import type { VoiceTranscriber } from "../domain/voice-transcriber";

export class OpenAIWhisperTranscriber implements VoiceTranscriber {
  private readonly openai: OpenAI;

  // db is accepted so the composition root can wire a single supabase client;
  // currently unused because we don't persist the audio file.
  constructor(_db?: ServerSupabaseClient) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async transcribe(
    audioBuffer: Buffer,
    _userId: string,
  ): Promise<{ text: string; durationMs: number; voiceUrl: string }> {
    const start = Date.now();

    const file = await toFile(audioBuffer, "audio.webm", {
      type: "audio/webm",
    });
    const transcription = await this.openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "pt",
    });

    return {
      text: transcription.text,
      durationMs: Date.now() - start,
      voiceUrl: "",
    };
  }
}
