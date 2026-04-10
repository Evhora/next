"use server";

import { revalidatePath } from "next/cache";

import { buildCtx } from "@/shared/context";
import { failFromError, ok, type ActionResult } from "@/shared/result";

import { createAction } from "../application/createAction";
import { deleteAction } from "../application/deleteAction";
import { updateActionStatus } from "../application/updateActionStatus";

const ACTIONS_PATH = "/dashboard/actions";

const parseNullableString = (value: FormDataEntryValue | null): string | null => {
  const s = value == null ? "" : String(value).trim();
  return s.length === 0 ? null : s;
};

export async function createActionAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await buildCtx();
    const action = await createAction(
      {
        title: String(formData.get("title") ?? ""),
        dreamId: parseNullableString(formData.get("dreamId")),
        dreamAreaOfLife: (() => {
          const raw = parseNullableString(formData.get("dreamAreaOfLife"));
          return raw == null ? null : Number(raw);
        })(),
        recurrence: Number(formData.get("recurrence") ?? 0),
        dueDate: parseNullableString(formData.get("dueDate")),
      },
      ctx,
    );
    revalidatePath(ACTIONS_PATH);
    revalidatePath("/dashboard/dreams");
    revalidatePath("/dashboard");
    return ok({ id: action.props.id });
  } catch (error) {
    return failFromError(error);
  }
}

export async function updateActionStatusAction(
  id: string,
  status: number,
): Promise<ActionResult> {
  try {
    const ctx = await buildCtx();
    await updateActionStatus({ id, status }, ctx);
    revalidatePath(ACTIONS_PATH);
    revalidatePath("/dashboard/dreams");
    revalidatePath("/dashboard");
    return ok(undefined);
  } catch (error) {
    return failFromError(error);
  }
}

export async function deleteActionAction(id: string): Promise<ActionResult> {
  try {
    const ctx = await buildCtx();
    await deleteAction({ id }, ctx);
    revalidatePath(ACTIONS_PATH);
    revalidatePath("/dashboard/dreams");
    revalidatePath("/dashboard");
    return ok(undefined);
  } catch (error) {
    return failFromError(error);
  }
}
