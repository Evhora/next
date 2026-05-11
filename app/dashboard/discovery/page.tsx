import { buildCtx } from "@/shared/context";
import { startSession } from "@/modules/discovery/application/start-session";
import { QuizShell } from "@/modules/discovery/ui/quiz-shell";

export default async function DiscoveryPage() {
  const ctx = await buildCtx();
  const initial = await startSession(ctx);
  return <QuizShell initial={initial} />;
}
