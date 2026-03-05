import { ActionStatus, ActionStatusNames } from "@/lib/domain/enums/action";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface PatchActionBody {
  status: number;
}

export async function PATCH(
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

    const body: PatchActionBody = await _request.json();
    const { status } = body;

    if (status === undefined || status === null) {
      return NextResponse.json(
        { error: "Missing required field: status" },
        { status: 400 },
      );
    }

    const validStatuses = [
      ActionStatus.UNSPECIFIED,
      ActionStatus.NOT_STARTED,
      ActionStatus.IN_PROGRESS,
      ActionStatus.COMPLETED,
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const statusName =
      ActionStatusNames[status as ActionStatus] ?? "UNSPECIFIED";

    const { data: existing, error: fetchError } = await supabase
      .from("actions")
      .select("id, data")
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Action not found or access denied" },
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

    const { data: row, error: updateError } = await supabase
      .from("actions")
      .update({
        status,
        status_name: statusName,
        updated_at: new Date().toISOString(),
        data: mergedData as never,
      } as Database["public"]["Tables"]["actions"]["Update"])
      .eq("id", id)
      .eq("user_id", user.id)
      .select("data")
      .single();

    if (updateError) {
      throw updateError;
    }

    type ActionRow = {
      data: Database["public"]["Tables"]["actions"]["Row"]["data"];
    };
    return NextResponse.json({
      action: row ? (row as ActionRow).data : null,
    });
  } catch (error: unknown) {
    console.error("Error updating action status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update action status",
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
      .from("actions")
      .select("id, data")
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Action not found or access denied" },
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

    const { error: updateError } = await supabase
      .from("actions")
      .update({
        deleted_at: now,
        updated_at: now,
        data: mergedData as never,
      } as Database["public"]["Tables"]["actions"]["Update"])
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting action:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete action",
      },
      { status: 500 },
    );
  }
}
