/**
 * Public surface of the DreamBoard module. Code outside `modules/dream-board/`
 * must import from here — never reach into `domain/`, `application/`, or
 * `infrastructure/` directly.
 *
 * `buildCtx` (shared) already wires the repositories; downstream callers only
 * need the types and the use-case functions.
 */

// ---------- Domain ------------------------------------------------------

export {
  archiveConversation,
  chooseDreams,
  chooseStyle,
  confirmPhotoUploaded,
  Conversation_ConversationState,
  Conversation_MessageRole,
  ConversationSchema,
  goBackToStyle,
  markDone,
  markFailed,
  markGenerating,
  newConversation,
  skipPhoto,
  softDeleteConversation,
  startFromGreeting,
  type Conversation,
  type Conversation_Message,
} from "./domain/conversation";
export type { ConversationRepository } from "./domain/conversation-repository";
export {
  DreamBoard_DreamBoardStyle,
  DreamBoardSchema,
  dreamBoardWithNewImage,
  newDreamBoard,
  softDeleteDreamBoard,
  type DreamBoard,
  type NewDreamBoardCmd,
} from "./domain/dream-board";
export type { DreamBoardRepository } from "./domain/dream-board-repository";
export {
  ConversationNotFoundError,
  DailyQuotaExceededError,
  DreamBoardNotFoundError,
  UserPhotoRequiredError,
} from "./domain/errors";
export {
  DREAM_BOARD_STYLE_LABELS,
  isDreamBoardStyle,
  SELECTABLE_DREAM_BOARD_STYLES,
} from "./domain/labels";
export {
  newUserPhoto,
  userPhotoReplaced,
  UserPhotoSchema,
  type UserPhoto,
} from "./domain/user-photo";
export type { UserPhotoRepository } from "./domain/user-photo-repository";

// ---------- Application (use cases) -------------------------------------

export { deleteConversation } from "./application/delete-conversation";
export { deleteDreamBoard } from "./application/delete-dream-board";
export {
  generateDreamBoard,
  type DreamBoardImageClient,
} from "./application/generate-dream-board";
export { getActiveConversation } from "./application/get-active-conversation";
export {
  getConversation,
  type ConversationView,
} from "./application/get-conversation";
export {
  getDreamBoardQuota,
  type DreamBoardQuota,
} from "./application/get-quota";
export { getUserPhoto, type UserPhotoView } from "./application/get-user-photo";
export {
  listConversations,
  type ConversationListItem,
} from "./application/list-conversations";
export {
  listDreamBoards,
  type DreamBoardView,
} from "./application/list-dream-boards";
export { regenerateDreamBoard } from "./application/regenerate-dream-board";
export {
  replyCmdSchema,
  replyToConversation,
  type ReplyCmd,
} from "./application/reply-to-conversation";
export {
  deleteDreamBoardSchema,
  generateDreamBoardSchema,
  regenerateDreamBoardSchema,
  uploadUserPhotoSchema,
  type DeleteDreamBoardCmd,
  type GenerateDreamBoardCmd,
  type RegenerateDreamBoardCmd,
  type UploadUserPhotoCmd,
} from "./application/schemas";
export { startConversation } from "./application/start-conversation";
export { uploadUserPhoto } from "./application/upload-user-photo";

// ---------- Infrastructure ---------------------------------------------

export { GeminiImageClient } from "./infrastructure/gemini-image-client";
export { SupabaseConversationRepository } from "./infrastructure/supabase-conversation-repository";
export { SupabaseDreamBoardRepository } from "./infrastructure/supabase-dream-board-repository";
export { SupabaseUserPhotoRepository } from "./infrastructure/supabase-user-photo-repository";
