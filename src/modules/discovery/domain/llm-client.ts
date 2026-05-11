import type { Answer, DreamCandidate } from "../proto/v1/session_pb";

export interface RoutingDecision {
  action: "deeper" | "advance" | "skip_phase" | "synthesize";
  nextQuestionId?: string;
}

export interface LlmClient {
  nextQuestionHint(answers: Answer[]): Promise<RoutingDecision>;
  synthesize(answers: Answer[]): Promise<DreamCandidate[]>;
}
