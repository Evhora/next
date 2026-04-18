/**
 * Public surface of the Dreams module. Anything outside `modules/dreams/`
 * should import from here — never reach into `domain/`, `application/`, or
 * `infrastructure/` directly.
 */

export {
  Dream_DreamAreaOfLife,
  Dream_DreamStatus,
  DreamSchema,
  dreamWithStatus,
  newDream,
  softDeleteDream,
  type Dream,
  type NewDreamCmd,
} from "./domain/dream";
export type { DreamRepository } from "./domain/dream-repository";
export { DreamNotFoundError } from "./domain/errors";
export {
  DREAM_AREA_OF_LIFE_LABELS,
  DREAM_STATUS_LABELS,
  isDreamAreaOfLife,
  isDreamStatus,
  SELECTABLE_DREAM_AREAS_OF_LIFE,
  SELECTABLE_DREAM_STATUSES,
} from "./domain/labels";

export { createDream } from "./application/create-dream";
export { deleteDream } from "./application/delete-dream";
export { listDreamsForUser } from "./application/list-dreams-for-user";
export {
  createDreamSchema,
  deleteDreamSchema,
  updateDreamStatusSchema,
  type CreateDreamCmd,
  type DeleteDreamCmd,
  type UpdateDreamStatusCmd,
} from "./application/schemas";
export { updateDreamStatus } from "./application/update-dream-status";

export { SupabaseDreamRepository } from "./infrastructure/supabase-dream-repository";
