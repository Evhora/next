import type { VoiceTranscriber } from "../domain/voice-transcriber";

export class NoopVoiceTranscriber implements VoiceTranscriber {
  async transcribe(): Promise<{ text: string; durationMs: number; voiceUrl: string }> {
    return { text: "", durationMs: 0, voiceUrl: "" };
  }
}
