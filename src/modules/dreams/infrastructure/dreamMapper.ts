import { Dream, DreamProps } from "../domain/Dream";
import {
  DREAM_AREA_OF_LIFE_LABELS,
  DreamAreaOfLife,
  isDreamAreaOfLife,
} from "../domain/DreamAreaOfLife";
import { DREAM_STATUS_LABELS, DreamStatus, isDreamStatus } from "../domain/DreamStatus";

import type { Database, Json } from "@/shared/supabase/database.types";

/**
 * The *only* place that knows the row layout. Everywhere else in the dreams
 * module deals in `Dream` entities. Two responsibilities:
 *
 *   1. `toDream(row)` — splice the JSONB `data` blob and the promoted columns
 *      back together into a single typed entity.
 *   2. `toInsertRow(dream)` / `toUpdateRow(dream)` — split the entity back into
 *      column values + a `data` blob that contains *only* the fields that are
 *      not already in promoted columns.
 *
 * Keeping the JSONB blob deduplicated with the columns is what stops the
 * old `status` / `status_name` / `data.status` triple-write drift.
 */

type DreamRow = Database["public"]["Tables"]["dreams"]["Row"];
type DreamInsert = Database["public"]["Tables"]["dreams"]["Insert"];
type DreamUpdate = Database["public"]["Tables"]["dreams"]["Update"];

/**
 * Shape of the JSONB `data` column for dreams. Internal to this file.
 *
 * The blob mirrors the **entire entity** — every `DreamProps` field is
 * duplicated here. The promoted columns (`status`, `area_of_life`, ...) remain
 * authoritative for queries; `data` is the full snapshot, useful for audit /
 * inspection / replays without joining typed columns.
 */
interface DreamData {
  id: string;
  userId: string;
  status: number;
  areaOfLife: number;
  title: string;
  deadline: string;
  actionPlan: string;
  version: number;
  sequence: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const isDreamData = (value: Json | undefined): value is DreamData & {
  [k: string]: Json | undefined;
} => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as { [k: string]: Json | undefined };
  return (
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.status === "number" &&
    typeof obj.areaOfLife === "number" &&
    typeof obj.title === "string" &&
    typeof obj.deadline === "string" &&
    typeof obj.actionPlan === "string" &&
    typeof obj.version === "number" &&
    typeof obj.sequence === "number" &&
    typeof obj.createdAt === "string" &&
    typeof obj.updatedAt === "string" &&
    (obj.deletedAt === null || typeof obj.deletedAt === "string")
  );
};

export const toDream = (row: DreamRow): Dream => {
  if (!isDreamData(row.data)) {
    throw new Error(
      `Corrupt dream row ${row.id}: data blob missing required fields.`,
    );
  }
  if (!isDreamStatus(row.status)) {
    throw new Error(`Corrupt dream row ${row.id}: invalid status ${row.status}`);
  }
  if (!isDreamAreaOfLife(row.area_of_life)) {
    throw new Error(
      `Corrupt dream row ${row.id}: invalid area_of_life ${row.area_of_life}`,
    );
  }

  const props: DreamProps = {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    areaOfLife: row.area_of_life,
    title: row.data.title,
    deadline: row.data.deadline,
    actionPlan: row.data.actionPlan,
    version: row.version,
    sequence: row.sequence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
  return Dream.rehydrate(props);
};

const unwrap = (dream: Dream) => dream.props;

/**
 * The blob is the *whole* entity. Promoted columns are still the source of
 * truth for queries, but `data` carries every field so a single SELECT on
 * `data` returns the complete dream.
 */
const buildDataBlob = (props: DreamProps): Json => ({
  id: props.id,
  userId: props.userId,
  status: props.status,
  areaOfLife: props.areaOfLife,
  title: props.title,
  deadline: props.deadline,
  actionPlan: props.actionPlan,
  version: props.version,
  sequence: props.sequence,
  createdAt: props.createdAt,
  updatedAt: props.updatedAt,
  deletedAt: props.deletedAt,
});

export const toInsertRow = (dream: Dream): DreamInsert => {
  const p = unwrap(dream);
  return {
    id: p.id,
    user_id: p.userId,
    status: p.status as DreamStatus,
    status_name: DREAM_STATUS_LABELS[p.status as DreamStatus],
    area_of_life: p.areaOfLife as DreamAreaOfLife,
    area_of_life_name: DREAM_AREA_OF_LIFE_LABELS[p.areaOfLife as DreamAreaOfLife],
    version: p.version,
    data: buildDataBlob(p),
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    deleted_at: p.deletedAt,
  };
};

export const toUpdateRow = (dream: Dream): DreamUpdate => {
  const p = unwrap(dream);
  return {
    status: p.status as DreamStatus,
    status_name: DREAM_STATUS_LABELS[p.status as DreamStatus],
    area_of_life: p.areaOfLife as DreamAreaOfLife,
    area_of_life_name: DREAM_AREA_OF_LIFE_LABELS[p.areaOfLife as DreamAreaOfLife],
    version: p.version,
    data: buildDataBlob(p),
    updated_at: p.updatedAt,
    deleted_at: p.deletedAt,
  };
};
