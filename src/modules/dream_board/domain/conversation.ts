import { create } from "@bufbuild/protobuf";
import { timestampNow } from "@bufbuild/protobuf/wkt";

import {
  type Conversation,
  Conversation_ConversationState,
  type Conversation_Message,
  Conversation_MessageRole,
  Conversation_MessageSchema,
  ConversationSchema,
} from "@/modules/dream_board/proto/v1/conversation_pb";
import { DreamBoard_DreamBoardStyle } from "@/modules/dream_board/proto/v1/dream_board_pb";

/**
 * Domain surface for the Conversation entity that drives the chat UI.
 * The state-machine transitions and bot-message composition live here so
 * the application layer stays trivial and the UI never invents transitions.
 *
 * Bot texts are stored as i18n keys (under `pages.dreamBoard.chat.messages.*`)
 * so the server doesn't bake in the user's locale. Params for interpolation
 * travel alongside the key in the message itself.
 */

export {
  Conversation_ConversationState,
  Conversation_MessageRole,
  ConversationSchema,
};
export type { Conversation, Conversation_Message };

// ----- Factories --------------------------------------------------------

export function newConversation(userId: string): Conversation {
  const now = timestampNow();
  return create(ConversationSchema, {
    id: crypto.randomUUID(),
    userId,
    state: Conversation_ConversationState.GREETING,
    messages: [
      create(Conversation_MessageSchema, {
        role: Conversation_MessageRole.BOT,
        key: "pages.dreamBoard.chat.messages.greeting",
        sentAt: now,
      }),
    ],
    selectedDreamIds: [],
    selectedStyle: DreamBoard_DreamBoardStyle.UNSPECIFIED,
    photoSkipped: false,
    version: 1n,
    createdAt: now,
    updatedAt: now,
  });
}

// ----- Transition helpers ----------------------------------------------

const bumped = (
  conv: Conversation,
  patch: Partial<Conversation>,
): Conversation =>
  create(ConversationSchema, {
    ...conv,
    ...patch,
    version: conv.version + 1n,
    updatedAt: timestampNow(),
  });

const botMessage = (
  key: string,
  params: Record<string, string> = {},
): Conversation_Message =>
  create(Conversation_MessageSchema, {
    role: Conversation_MessageRole.BOT,
    key,
    params,
    sentAt: timestampNow(),
  });

const userMessage = (
  key: string,
  params: Record<string, string> = {},
): Conversation_Message =>
  create(Conversation_MessageSchema, {
    role: Conversation_MessageRole.USER,
    key,
    params,
    sentAt: timestampNow(),
  });

/**
 * Append a BOT message with the given key (and optional params).
 * No transition — use the explicit transition functions below for that.
 */
export function withBotMessage(
  conv: Conversation,
  key: string,
  params: Record<string, string> = {},
): Conversation {
  return bumped(conv, {
    messages: [...conv.messages, botMessage(key, params)],
  });
}

/**
 * Append a USER message + advance state. Centralised so every transition
 * produces the same shape (user echo + bot reply + state change).
 */
const advance = (
  conv: Conversation,
  opts: {
    userKey: string;
    userParams?: Record<string, string>;
    botKey: string;
    botParams?: Record<string, string>;
    state: Conversation_ConversationState;
    patch?: Partial<Conversation>;
  },
): Conversation =>
  bumped(conv, {
    messages: [
      ...conv.messages,
      userMessage(opts.userKey, opts.userParams),
      botMessage(opts.botKey, opts.botParams),
    ],
    state: opts.state,
    ...opts.patch,
  });

// ----- State transitions -----------------------------------------------

export function startFromGreeting(conv: Conversation): Conversation {
  assertState(conv, Conversation_ConversationState.GREETING);
  return advance(conv, {
    userKey: "pages.dreamBoard.chat.messages.userStart",
    botKey: "pages.dreamBoard.chat.messages.askPhoto",
    state: Conversation_ConversationState.ASK_PHOTO,
  });
}

export function confirmPhotoUploaded(conv: Conversation): Conversation {
  assertState(conv, Conversation_ConversationState.ASK_PHOTO);
  return advance(conv, {
    userKey: "pages.dreamBoard.chat.messages.userPhotoUploaded",
    botKey: "pages.dreamBoard.chat.messages.askDreams",
    state: Conversation_ConversationState.ASK_DREAMS,
    patch: { photoSkipped: false },
  });
}

export function skipPhoto(conv: Conversation): Conversation {
  assertState(conv, Conversation_ConversationState.ASK_PHOTO);
  return advance(conv, {
    userKey: "pages.dreamBoard.chat.messages.userSkipPhoto",
    botKey: "pages.dreamBoard.chat.messages.askDreams",
    state: Conversation_ConversationState.ASK_DREAMS,
    patch: { photoSkipped: true },
  });
}

export function chooseDreams(
  conv: Conversation,
  dreamIds: string[],
  dreamTitles: string[],
): Conversation {
  assertState(conv, Conversation_ConversationState.ASK_DREAMS);
  if (dreamIds.length === 0) {
    throw new Error("At least one dream is required.");
  }
  return advance(conv, {
    userKey: "pages.dreamBoard.chat.messages.userChoseDreams",
    userParams: {
      titles: dreamTitles.join(" · "),
      count: String(dreamIds.length),
    },
    botKey: "pages.dreamBoard.chat.messages.askStyle",
    state: Conversation_ConversationState.ASK_STYLE,
    patch: { selectedDreamIds: dreamIds },
  });
}

export function chooseStyle(
  conv: Conversation,
  style: DreamBoard_DreamBoardStyle,
  styleLabelKey: string,
): Conversation {
  assertState(conv, Conversation_ConversationState.ASK_STYLE);
  return advance(conv, {
    userKey: "pages.dreamBoard.chat.messages.userChoseStyle",
    userParams: { styleLabelKey },
    botKey: "pages.dreamBoard.chat.messages.confirmSummary",
    state: Conversation_ConversationState.CONFIRM,
    patch: { selectedStyle: style },
  });
}

export function goBackToStyle(conv: Conversation): Conversation {
  assertState(conv, Conversation_ConversationState.CONFIRM);
  return advance(conv, {
    userKey: "pages.dreamBoard.chat.messages.userBack",
    botKey: "pages.dreamBoard.chat.messages.askStyle",
    state: Conversation_ConversationState.ASK_STYLE,
  });
}

export function markGenerating(conv: Conversation): Conversation {
  assertState(conv, Conversation_ConversationState.CONFIRM);
  return advance(conv, {
    userKey: "pages.dreamBoard.chat.messages.userGenerate",
    botKey: "pages.dreamBoard.chat.messages.generating",
    state: Conversation_ConversationState.GENERATING,
  });
}

export function markDone(
  conv: Conversation,
  dreamBoardId: string,
): Conversation {
  assertState(conv, Conversation_ConversationState.GENERATING);
  return bumped(conv, {
    messages: [
      ...conv.messages,
      botMessage("pages.dreamBoard.chat.messages.done"),
    ],
    state: Conversation_ConversationState.DONE,
    dreamBoardId,
    archivedAt: timestampNow(),
  });
}

export function markFailed(
  conv: Conversation,
  reasonKey: string,
): Conversation {
  return bumped(conv, {
    messages: [...conv.messages, botMessage(reasonKey)],
    state: Conversation_ConversationState.FAILED,
  });
}

export function archiveConversation(conv: Conversation): Conversation {
  return bumped(conv, { archivedAt: timestampNow() });
}

export function softDeleteConversation(conv: Conversation): Conversation {
  const now = timestampNow();
  return bumped(conv, { deletedAt: now, archivedAt: conv.archivedAt ?? now });
}

// ----- Guard -----------------------------------------------------------

function assertState(
  conv: Conversation,
  expected: Conversation_ConversationState,
): void {
  if (conv.state !== expected) {
    throw new Error(
      `Illegal conversation transition: expected state ${expected}, got ${conv.state}.`,
    );
  }
}
