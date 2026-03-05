import { DreamStatus, DreamStatusNames } from "@/lib/domain/enums/dream";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface PatchDreamBody {
  status: number;
}

const VALID_DREAM_STATUSES = [
  DreamStatus.UNSPECIFIED,
  DreamStatus.IN_PROGRESS,
  DreamStatus.COMPLETED,
  DreamStatus.PAUSED,
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PatchDreamBody = await request.json();
    const { status } = body;

    if (status === undefined || status === null) {
      return NextResponse.json(
        { error: "Missing required field: status" },
        { status: 400 },
      );
    }

    if (!VALID_DREAM_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const statusName = DreamStatusNames[status as DreamStatus] ?? "UNSPECIFIED";

    const { data: existing, error: fetchError } = await supabase
      .from("dreams")
      .select("id, data")
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Dream not found or access denied" },
        { status: 404 },
      );
    }

    const currentData = (
      existing as { id: string; data: Record<string, unknown> }
    ).data;
    const mergedData = {
      ...currentData,
      status: statusName,
      updatedAt: new Date().toISOString(),
    };

    const updatePayload: Database["public"]["Tables"]["dreams"]["Update"] = {
      status,
      status_name: statusName,
      updated_at: new Date().toISOString(),
      data: mergedData as never,
    };
    const { data: row, error: updateError } = await supabase
      .from("dreams")
      .update(updatePayload as never)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("data")
      .single();

    if (updateError) {
      throw updateError;
    }

    type DreamRow = {
      data: Database["public"]["Tables"]["dreams"]["Row"]["data"];
    };
    return NextResponse.json({
      dream: row ? (row as DreamRow).data : null,
    });
  } catch (error: unknown) {
    console.error("Error updating dream status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update dream status",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existing, error: fetchError } = await supabase
      .from("dreams")
      .select("id, data")
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Dream not found or access denied" },
        { status: 404 },
      );
    }

    const now = new Date().toISOString();
    const currentData = (
      existing as { id: string; data: Record<string, unknown> }
    ).data;
    const mergedData = {
      ...currentData,
      deletedAt: now,
      updatedAt: now,
    };

    const deleteUpdatePayload: Database["public"]["Tables"]["dreams"]["Update"] =
      {
        deleted_at: now,
        updated_at: now,
        data: mergedData as never,
      };
    const { error: updateError } = await supabase
      .from("dreams")
      .update(deleteUpdatePayload as never)
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting dream:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete dream",
      },
      { status: 500 },
    );
  }
}
