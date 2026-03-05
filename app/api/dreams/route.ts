import { Dream } from "@/lib/domain/entities/dream";
import {
  DreamAreaOfLife,
  DreamAreaOfLifeNames,
  DreamStatus,
  DreamStatusNames,
} from "@/lib/domain/enums/dream";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface CreateDreamBody {
  title: string;
  areaOfLife: DreamAreaOfLife;
  deadline: string;
  actionPlan: string;
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
      .from("dreams")
      .select("data")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    type DreamRow = {
      data: Database["public"]["Tables"]["dreams"]["Row"]["data"];
    };
    const dreams = (rows ?? []).map((row: DreamRow) => row.data);
    return NextResponse.json({ dreams });
  } catch (error) {
    console.error("Error fetching dreams:", error);
    return NextResponse.json(
      { error: "Failed to fetch dreams" },
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

    const body: CreateDreamBody = await request.json();
    const { title, areaOfLife, deadline, actionPlan } = body;
    if (!title || !areaOfLife || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const dreamId = crypto.randomUUID();
    const now = new Date().toISOString();

    const area_of_life_name = DreamAreaOfLifeNames[areaOfLife];
    const status_name = DreamStatusNames[DreamStatus.IN_PROGRESS];
    const data = new Dream(
      dreamId,
      user.id,
      DreamStatus.IN_PROGRESS,
      areaOfLife,
      title,
      deadline,
      actionPlan,
      1,
      1,
      now,
      now,
    );

    const insertData = {
      id: dreamId,
      user_id: user.id,
      status: DreamStatus.IN_PROGRESS,
      status_name,
      area_of_life: areaOfLife,
      area_of_life_name,
      version: 1,
      data: data.toDbJson(),
    } satisfies Database["public"]["Tables"]["dreams"]["Insert"];

    const { error: insertError } = await supabase
      .from("dreams")
      .insert(insertData as never);

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error creating dream:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create dream",
      },
      { status: 500 },
    );
  }
}
