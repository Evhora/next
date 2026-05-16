import type { VoiceTranscriber } from "../domain/voice-transcriber";

export interface TranscribeVoiceResult {
  text: string;
  durationMs: number;
  voiceUrl: string;
}

export const transcribeVoice = async (
  audioBuffer: Buffer,
  userId: string,
  ctx: { voiceTranscriber: VoiceTranscriber },
): Promise<TranscribeVoiceResult> => {
  return ctx.voiceTranscriber.transcribe(audioBuffer, userId);
};
