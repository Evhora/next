/**
 * Public surface of the Actions module. Consumers outside `modules/actions/`
 * import from here — never reach into inner layers.
 */

export {
  Action_ActionRecurrence,
  Action_ActionStatus,
  ActionSchema,
  actionWithStatus,
  newAction,
  softDeleteAction,
  type Action,
  type NewActionCmd,
} from "./domain/action";
export type { ActionRepository } from "./domain/action-repository";
export { ActionNotFoundError } from "./domain/errors";
export {
  ACTION_RECURRENCE_LABELS,
  ACTION_STATUS_LABELS,
  isActionRecurrence,
  isActionStatus,
  SELECTABLE_ACTION_RECURRENCES,
  SELECTABLE_ACTION_STATUSES,
} from "./domain/labels";

export { createAction } from "./application/create-action";
export { deleteAction } from "./application/delete-action";
export { listActionsForUser } from "./application/list-actions-for-user";
export {
  createActionSchema,
  deleteActionSchema,
  updateActionStatusSchema,
  type CreateActionCmd,
  type DeleteActionCmd,
  type UpdateActionStatusCmd,
} from "./application/schemas";
export { updateActionStatus } from "./application/update-action-status";

export { SupabaseActionRepository } from "./infrastructure/supabase-action-repository";
