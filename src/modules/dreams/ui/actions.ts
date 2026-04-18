"use server";

import { revalidatePath } from "next/cache";

import { buildCtx } from "@/shared/context";
import { failFromError, ok, type ActionResult } from "@/shared/result";

import { createDream } from "../application/create-dream";
import { deleteDream } from "../application/delete-dream";
import { updateDreamStatus } from "../application/update-dream-status";

/**
 * Server actions for the Dreams module. Each action is a thin shell:
 *
 *   1. build the request context (auth + repos)
 *   2. parse the form payload into the use-case command
 *   3. invoke the use case
 *   4. revalidate the affected pages
 *   5. return a typed `ActionResult` so the client can render errors
 *
 * Actions never throw across the wire; thrown errors are converted via
 * `failFromError`. Use cases still throw — that's where the domain semantics
 * live — and this layer translates.
 */

const DREAMS_PATH = "/dashboard/dreams";

export async function createDreamAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await buildCtx();
    const dream = await createDream(
      {
        title: String(formData.get("title") ?? ""),
        areaOfLife: Number(formData.get("areaOfLife") ?? 0),
        deadline: String(formData.get("deadline") ?? ""),
        actionPlan: String(formData.get("actionPlan") ?? ""),
      },
      ctx,
    );
    revalidatePath(DREAMS_PATH);
    revalidatePath("/dashboard");
    return ok({ id: dream.id });
  } catch (error) {
    return failFromError(error);
  }
}

export async function updateDreamStatusAction(
  id: string,
  status: number,
): Promise<ActionResult> {
  try {
    const ctx = await buildCtx();
    await updateDreamStatus({ id, status }, ctx);
    revalidatePath(DREAMS_PATH);
    revalidatePath("/dashboard");
    return ok(undefined);
  } catch (error) {
    return failFromError(error);
  }
}

export async function deleteDreamAction(id: string): Promise<ActionResult> {
  try {
    const ctx = await buildCtx();
    await deleteDream({ id }, ctx);
    revalidatePath(DREAMS_PATH);
    revalidatePath("/dashboard");
    return ok(undefined);
  } catch (error) {
    return failFromError(error);
  }
}
