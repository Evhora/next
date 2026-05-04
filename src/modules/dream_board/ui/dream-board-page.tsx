import { getTranslations } from "next-intl/server";

import { getActiveConversation } from "@/modules/dream_board/application/get-active-conversation";
import { getConversation } from "@/modules/dream_board/application/get-conversation";
import { getDreamBoardQuota } from "@/modules/dream_board/application/get-quota";
import { listConversations } from "@/modules/dream_board/application/list-conversations";
import {
  Conversation_ConversationState,
  Conversation_MessageRole,
} from "@/modules/dream_board/domain/conversation";
import { SELECTABLE_DREAM_BOARD_STYLES } from "@/modules/dream_board/domain/labels";
import { listDreamsForUser } from "@/modules/dreams/application/list-dreams-for-user";
import { buildCtx } from "@/shared/context";
import { toProtoJson } from "@/shared/proto/json";

import { ConversationSchema } from "../proto/v1/conversation_pb";

import {
  DreamBoardClient,
  type ConversationListItemView,
  type ConversationView,
} from "./dream-board-client";

export async function DreamBoardPage({
  searchParams,
}: {
  searchParams?: Promise<{ c?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const selectedId = params.c;

  const [t, ctx] = await Promise.all([getTranslations(), buildCtx()]);

  const [dreams, convList, quota] = await Promise.all([
    listDreamsForUser(ctx),
    listConversations(ctx),
    getDreamBoardQuota(ctx),
  ]);

  let currentConv: ConversationView | null = null;
  if (selectedId) {
    try {
      const view = await getConversation({ id: selectedId }, ctx);
      currentConv = {
        conversationJson: toProtoJson(ConversationSchema, view.conversation),
        imageUrl: view.imageUrl,
      };
    } catch {
      currentConv = null;
    }
  } else {
    const active = await getActiveConversation(ctx);
    if (active) {
      currentConv = {
        conversationJson: toProtoJson(ConversationSchema, active),
        imageUrl: null,
      };
    }
  }

  const dreamOptions = dreams.map((d) => ({
    id: d.id,
    title: d.title,
    areaOfLife: d.areaOfLife,
  }));

  const sidebarItems: ConversationListItemView[] = convList.map((item) => {
    const lastBot = [...item.conversation.messages]
      .reverse()
      .find((m) => m.role === Conversation_MessageRole.BOT);
    return {
      id: item.conversation.id,
      state: item.conversation.state,
      imageUrl: item.imageUrl,
      preview: lastBot
        ? t(lastBot.key as Parameters<typeof t>[0], lastBot.params)
        : t("pages.dreamBoard.sidebar.untitled"),
      createdAtMs: item.conversation.createdAt
        ? Number(item.conversation.createdAt.seconds) * 1000
        : 0,
      isDone: item.conversation.state === Conversation_ConversationState.DONE,
    };
  });

  return (
    <div className="flex flex-1 max-h-screen bg-background">
      <DreamBoardClient
        dreams={dreamOptions}
        conversations={sidebarItems}
        current={currentConv}
        selectedId={selectedId ?? null}
        quota={quota}
        selectableStyles={[...SELECTABLE_DREAM_BOARD_STYLES]}
      />
    </div>
  );
}
