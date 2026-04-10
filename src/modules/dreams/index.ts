/**
 * Public surface of the Dreams module. Anything outside `modules/dreams/`
 * should import from here — never reach into `domain/`, `application/`, or
 * `infrastructure/` directly.
 */

export { Dream, type DreamProps, type NewDreamInput } from "./domain/Dream";
export {
  DreamStatus,
  DREAM_STATUS_LABELS,
  SELECTABLE_DREAM_STATUSES,
} from "./domain/DreamStatus";
export {
  DreamAreaOfLife,
  DREAM_AREA_OF_LIFE_LABELS,
  SELECTABLE_DREAM_AREAS_OF_LIFE,
} from "./domain/DreamAreaOfLife";
export { DreamNotFoundError } from "./domain/errors";
export type { DreamRepository } from "./domain/DreamRepository";

export { createDream } from "./application/createDream";
export { listDreamsForUser } from "./application/listDreamsForUser";
export { updateDreamStatus } from "./application/updateDreamStatus";
export { deleteDream } from "./application/deleteDream";
export {
  createDreamSchema,
  updateDreamStatusSchema,
  deleteDreamSchema,
  type CreateDreamInput,
  type UpdateDreamStatusInput,
  type DeleteDreamInput,
} from "./application/schemas";

export { SupabaseDreamRepository } from "./infrastructure/SupabaseDreamRepository";
