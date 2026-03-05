import type { Json } from "@/lib/supabase/database.types";
import type { ActionRecurrence, ActionStatus } from "../enums/action";
import type { DreamAreaOfLife } from "../enums/dream";

export class Action {
  public id: string;
  public userId: string;
  public dreamId: string | null;
  public parentActionId: string | null;
  public title: string;
  public dreamAreaOfLife: DreamAreaOfLife | null;
  public status: ActionStatus;
  public recurrence: ActionRecurrence | null;
  public dueDate: string | null;
  public version: number;
  public createdAt: string;
  public updatedAt: string;
  public deletedAt: string | null = null;

  constructor(
    id: string,
    userId: string,
    dreamId: string | null,
    parentActionId: string | null,
    title: string,
    dreamAreaOfLife: DreamAreaOfLife | null,
    status: ActionStatus,
    recurrence: ActionRecurrence | null,
    dueDate: string | null,
    version: number,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.userId = userId;
    this.dreamId = dreamId;
    this.parentActionId = parentActionId;
    this.title = title;
    this.dreamAreaOfLife = dreamAreaOfLife;
    this.status = status;
    this.recurrence = recurrence;
    this.dueDate = dueDate;
    this.version = version;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toDbJson(): Json {
    return {
      id: this.id,
      user_id: this.userId,
      dream_id: this.dreamId,
      parent_action_id: this.parentActionId,
      title: this.title,
      dream_area_of_life: this.dreamAreaOfLife,
      status: this.status,
      recurrence: this.recurrence,
      due_date: this.dueDate,
      version: this.version,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      deleted_at: this.deletedAt,
    };
  }
}
