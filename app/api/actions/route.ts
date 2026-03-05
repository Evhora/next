import {
  ActionRecurrence,
  ActionRecurrenceNames,
  ActionStatus,
  ActionStatusNames,
} from "@/lib/domain/enums/action";
import { DreamAreaOfLifeNames } from "@/lib/domain/enums/dream";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface CreateActionBody {
  title: string;
  due_date?: string | null;
  recurrence: number;
  dream_id?: string | null;
  area_of_life?: string | null;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: rows, error } = await supabase
      .from("actions")
      .select("data")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    type ActionRow = {
      data: Database["public"]["Tables"]["actions"]["Row"]["data"];
    };
    const actions = (rows ?? []).map((row: ActionRow) => row.data);
    return NextResponse.json({ actions });
  } catch (error) {
    console.error("Error fetching actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch actions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateActionBody = await request.json();
    const { title, due_date, recurrence, dream_id, area_of_life } = body;

    if (!title || recurrence === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: title, recurrence" },
        { status: 400 },
      );
    }

    const actionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const status_name = ActionStatusNames[ActionStatus.NOT_STARTED];
    const recurrence_label =
      ActionRecurrenceNames[recurrence as ActionRecurrence] ?? "UNSPECIFIED";
    const dreamAreaOfLife_label =
      area_of_life != null
        ? (DreamAreaOfLifeNames[
            area_of_life as keyof typeof DreamAreaOfLifeNames
          ] ?? null)
        : null;

    const insertData = {
      id: actionId,
      user_id: user.id,
      dream_id: dream_id ?? null,
      parent_action_id: null,
      status: ActionStatus.NOT_STARTED,
      status_name,
      version: 1,
      data: {
        id: actionId,
        userId: user.id,
        dreamId: dream_id ?? null,
        parentActionId: null,
        title,
        dreamAreaOfLife: dreamAreaOfLife_label,
        status: status_name,
        recurrence: recurrence_label,
        dueDate: due_date ?? null,
        version: 1,
        sequence: 0,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    } satisfies Database["public"]["Tables"]["actions"]["Insert"];

    const { data: row, error: insertError } = await supabase
      .from("actions")
      .insert(insertData as never)
      .select("data")
      .single();

    if (insertError) {
      throw insertError;
    }

    type ActionRow = {
      data: Database["public"]["Tables"]["actions"]["Row"]["data"];
    };
    return NextResponse.json({
      action: row ? (row as ActionRow).data : null,
    });
  } catch (error: unknown) {
    console.error("Error creating action:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create action",
      },
      { status: 500 },
    );
  }
}
