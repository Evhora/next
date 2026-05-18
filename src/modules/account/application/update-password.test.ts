import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { ValidationError } from "@/shared/errors";

import { updatePassword } from "./update-password";

function makeSupabase() {
  return {
    auth: {
      updateUser: vi.fn().mockResolvedValue({ error: null }),
    },
  } as unknown as SupabaseClient;
}

describe("updatePassword", () => {
  it.each([
    ["short", "A1!shrt"],
    ["without a special character", "Password1"],
    ["without a number", "Password!"],
    ["without an uppercase letter", "password1!"],
  ])("rejects a password %s", async (_case, newPassword) => {
    const supabase = makeSupabase();

    await expect(
      updatePassword(
        { newPassword, confirmPassword: newPassword },
        supabase,
      ),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it("updates a password that satisfies the policy", async () => {
    const supabase = makeSupabase();

    await updatePassword(
      { newPassword: "Password1!", confirmPassword: "Password1!" },
      supabase,
    );

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: "Password1!",
    });
  });
});
