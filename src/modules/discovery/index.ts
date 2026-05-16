// Domain
export type { SessionRepository } from "./domain/session-repository";
export type { LlmClient, RoutingDecision } from "./domain/llm-client";
export type { VoiceTranscriber } from "./domain/voice-transcriber";
export {
  newSession,
  appendAnswer,
  advancePhase,
  setCandidates,
  markCompleted,
  markSynthesizing,
} from "./domain/session";
export {
  SessionNotFoundError,
  SessionAlreadyCompletedError,
  SynthesisFailedError,
  QuotaExceededError,
} from "./domain/errors";
export { QUESTION_BANK, QUESTIONS_BY_ID, QUESTIONS_BY_PHASE, PHASE_ORDER } from "./domain/question-bank";

// Proto types
export type { DreamArcheologySession, Answer, DreamCandidate, EvidenceQuote } from "./proto/v1/session_pb";
export { Phase, SessionStatus } from "./proto/v1/session_pb";
export type { Question } from "./proto/v1/question_pb";

// Application
export { startSession } from "./application/start-session";
export { answerQuestion } from "./application/answer-question";
export { synthesizeCandidates } from "./application/synthesize-candidates";
export { selectCandidates } from "./application/select-candidates";
export { transcribeVoice } from "./application/transcribe-voice";
export { listSessions } from "./application/list-sessions";
export { getActiveSession, TARGET_ANSWERS } from "./application/get-active-session";
export { abandonSession } from "./application/abandon-session";

// Infrastructure
export { SupabaseSessionRepository } from "./infrastructure/supabase-session-repository";
export { OpenRouterLlmClient } from "./infrastructure/openrouter-llm-client";
export { OpenAIWhisperTranscriber } from "./infrastructure/openai-whisper-transcriber";

// UI
export { QuizShell } from "./ui/quiz-shell";
