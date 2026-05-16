export interface TranscribeResult {
  text: string;
  durationMs: number;
}

export interface VoiceTranscriber {
  transcribe(audioBlob: Buffer, userId: string): Promise<TranscribeResult & { voiceUrl: string }>;
}
