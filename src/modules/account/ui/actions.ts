"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/shared/supabase/admin";
import { createClient } from "@/shared/supabase/server";
import { failFromError, ok, type ActionResult } from "@/shared/result";

import { deleteAccount } from "../application/delete-account";
import { updatePassword } from "../application/update-password";
import { updateProfile } from "../application/update-profile";
import { uploadAvatar } from "../application/upload-avatar";

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    await updateProfile(
      {
        firstName: (formData.get("firstName") as string) ?? "",
        lastName: (formData.get("lastName") as string) ?? "",
      },
      supabase,
    );
    revalidatePath("/dashboard");
    return ok(undefined);
  } catch (e) {
    return failFromError(e);
  }
}

export async function updatePasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    await updatePassword(
      {
        newPassword: (formData.get("newPassword") as string) ?? "",
        confirmPassword: (formData.get("confirmPassword") as string) ?? "",
      },
      supabase,
    );
    return ok(undefined);
  } catch (e) {
    return failFromError(e);
  }
}

export async function uploadAvatarAction(
  avatarUrl: string,
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    await uploadAvatar({ avatarUrl }, supabase);
    revalidatePath("/dashboard");
    return ok(undefined);
  } catch (e) {
    return failFromError(e);
  }
}

export async function deleteAccountAction(userId: string): Promise<void> {
  const adminSupabase = createAdminClient();
  await deleteAccount(userId, adminSupabase);
  redirect("/auth/login");
}
