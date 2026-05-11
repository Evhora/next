import type { SupabaseClient } from "@supabase/supabase-js";

import { IntegrationError, ValidationError } from "@/shared/errors";

import { UploadAvatarSchema, type UploadAvatarCmd } from "./schemas";

export async function uploadAvatar(
  cmd: UploadAvatarCmd,
  supabase: SupabaseClient,
): Promise<void> {
  const parsed = UploadAvatarSchema.safeParse(cmd);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message);
  }

  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: parsed.data.avatarUrl },
  });

  if (error) throw new IntegrationError(error.message);
}
