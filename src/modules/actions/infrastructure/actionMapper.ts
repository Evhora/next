import { isDreamAreaOfLife } from "@/modules/dreams/domain/DreamAreaOfLife";

import { Action, ActionProps } from "../domain/Action";
import {
  ACTION_RECURRENCE_LABELS,
  ActionRecurrence,
  isActionRecurrence,
} from "../domain/ActionRecurrence";
import { ACTION_STATUS_LABELS, ActionStatus, isActionStatus } from "../domain/ActionStatus";

import type { Database, Json } from "@/shared/supabase/database.types";

/**
 * Single source of truth for the action row layout.
 *
 * Promoted columns: id, user_id, dream_id, parent_action_id, status,
 * version, sequence, created_at, updated_at, deleted_at.
 *
 * Everything else (title, dreamAreaOfLife, recurrence, dueDate) lives in the
 * JSONB `data` blob. Adding a new field means editing this file and the
 * domain — no migration.
 */

type ActionRow = Database["public"]["Tables"]["actions"]["Row"];
type ActionInsert = Database["public"]["Tables"]["actions"]["Insert"];
type ActionUpdate = Database["public"]["Tables"]["actions"]["Update"];

/**
 * Shape of the JSONB `data` column for actions. The blob mirrors the **entire
 * entity** — every `ActionProps` field is duplicated here. Promoted columns
 * remain authoritative for queries; `data` carries the full snapshot.
 */
interface ActionData {
  id: string;
  userId: string;
  dreamId: string | null;
  parentActionId: string | null;
  status: number;
  title: string;
  dreamAreaOfLife: number | null;
  recurrence: number;
  dueDate: string | null;
  version: number;
  sequence: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const isActionData = (value: Json | undefined): value is ActionData & {
  [k: string]: Json | undefined;
} => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as { [k: string]: Json | undefined };
  return (
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    (obj.dreamId === null || typeof obj.dreamId === "string") &&
    (obj.parentActionId === null || typeof obj.parentActionId === "string") &&
    typeof obj.status === "number" &&
    typeof obj.title === "string" &&
    (obj.dreamAreaOfLife === null || typeof obj.dreamAreaOfLife === "number") &&
    typeof obj.recurrence === "number" &&
    (obj.dueDate === null || typeof obj.dueDate === "string") &&
    typeof obj.version === "number" &&
    typeof obj.sequence === "number" &&
    typeof obj.createdAt === "string" &&
    typeof obj.updatedAt === "string" &&
    (obj.deletedAt === null || typeof obj.deletedAt === "string")
  );
};

export const toAction = (row: ActionRow): Action => {
  if (!isActionData(row.data)) {
    throw new Error(
      `Corrupt action row ${row.id}: data blob missing required fields.`,
    );
  }
  if (!isActionStatus(row.status)) {
    throw new Error(
      `Corrupt action row ${row.id}: invalid status ${row.status}`,
    );
  }
  if (!isActionRecurrence(row.data.recurrence)) {
    throw new Error(
      `Corrupt action row ${row.id}: invalid recurrence ${row.data.recurrence}`,
    );
  }
  const area = row.data.dreamAreaOfLife;
  if (area !== null && !isDreamAreaOfLife(area)) {
    throw new Error(
      `Corrupt action row ${row.id}: invalid dreamAreaOfLife ${area}`,
    );
  }

  const props: ActionProps = {
    id: row.id,
    userId: row.user_id,
    dreamId: row.dream_id,
    parentActionId: row.parent_action_id,
    status: row.status,
    title: row.data.title,
    dreamAreaOfLife: area,
    recurrence: row.data.recurrence,
    dueDate: row.data.dueDate,
    version: row.version,
    sequence: row.sequence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
  return Action.rehydrate(props);
};

const buildDataBlob = (props: ActionProps): Json => ({
  id: props.id,
  userId: props.userId,
  dreamId: props.dreamId,
  parentActionId: props.parentActionId,
  status: props.status,
  title: props.title,
  dreamAreaOfLife: props.dreamAreaOfLife,
  recurrence: props.recurrence,
  dueDate: props.dueDate,
  version: props.version,
  sequence: props.sequence,
  createdAt: props.createdAt,
  updatedAt: props.updatedAt,
  deletedAt: props.deletedAt,
});

export const toInsertRow = (action: Action): ActionInsert => {
  const p = action.props;
  return {
    id: p.id,
    user_id: p.userId,
    dream_id: p.dreamId,
    parent_action_id: p.parentActionId,
    status: p.status as ActionStatus,
    status_name: ACTION_STATUS_LABELS[p.status as ActionStatus],
    version: p.version,
    data: buildDataBlob(p),
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    deleted_at: p.deletedAt,
  };
};

export const toUpdateRow = (action: Action): ActionUpdate => {
  const p = action.props;
  return {
    dream_id: p.dreamId,
    parent_action_id: p.parentActionId,
    status: p.status as ActionStatus,
    status_name: ACTION_STATUS_LABELS[p.status as ActionStatus],
    version: p.version,
    data: buildDataBlob(p),
    updated_at: p.updatedAt,
    deleted_at: p.deletedAt,
  };
};

// Re-export label maps so callers don't have to import twice.
export { ACTION_RECURRENCE_LABELS };
export type { ActionRecurrence };
