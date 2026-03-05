import type { Json } from "@/lib/supabase/database.types";
import type { DreamAreaOfLife, DreamStatus } from "../enums/dream";

export class Dream {
  public id: string;
  public userId: string;
  public status: DreamStatus;
  public areaOfLife: DreamAreaOfLife;
  public title: string;
  public deadline: string;
  public actionPlan: string;
  public version: number;
  public sequence: number;
  public createdAt: string;
  public updatedAt: string;
  public deletedAt: string | null = null;

  constructor(
    id: string,
    userId: string,
    status: DreamStatus,
    areaOfLife: DreamAreaOfLife,
    title: string,
    deadline: string,
    actionPlan: string,
    version: number,
    sequence: number,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.userId = userId;
    this.status = status;
    this.areaOfLife = areaOfLife;
    this.title = title;
    this.deadline = deadline;
    this.actionPlan = actionPlan;
    this.version = version;
    this.sequence = sequence;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toDbJson(): Json {
    return {
      id: this.id,
      user_id: this.userId,
      status: this.status,
      area_of_life: this.areaOfLife,
      title: this.title,
      deadline: this.deadline,
      action_plan: this.actionPlan,
      version: this.version,
      sequence: this.sequence,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      deleted_at: this.deletedAt,
    };
  }
}
