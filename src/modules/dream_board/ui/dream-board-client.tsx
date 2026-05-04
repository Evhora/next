"use client";

import type { JsonValue } from "@bufbuild/protobuf";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUp,
  Camera,
  Clapperboard,
  Download,
  Droplets,
  Loader2,
  MessageSquarePlus,
  Paintbrush,
  Plus,
  Scissors,
  Sparkles,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  Conversation_ConversationState,
  Conversation_MessageRole,
  type Conversation,
} from "@/modules/dream_board/domain/conversation";
import { DreamBoard_DreamBoardStyle } from "@/modules/dream_board/domain/dream-board";
import { DREAM_BOARD_STYLE_LABELS } from "@/modules/dream_board/domain/labels";
import { ConversationSchema } from "@/modules/dream_board/proto/v1/conversation_pb";
import { NewDreamDialog } from "@/modules/dreams";
import { Dream_DreamAreaOfLife } from "@/modules/dreams/domain/dream";
import {
  DREAM_AREA_OF_LIFE_LABELS,
  SELECTABLE_DREAM_AREAS_OF_LIFE,
} from "@/modules/dreams/domain/labels";
import { fromProtoJson } from "@/shared/proto/json";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/shared/utils";

import {
  deleteConversationAction,
  replyToConversationAction,
  startNewChatAction,
} from "./actions";

export interface DreamOption {
  id: string;
  title: string;
  areaOfLife: Dream_DreamAreaOfLife;
}

export interface ConversationListItemView {
  id: string;
  state: number;
  imageUrl: string | null;
  preview: string;
  createdAtMs: number;
  isDone: boolean;
}

export interface ConversationView {
  conversationJson: JsonValue;
  imageUrl: string | null;
}

export interface DreamBoardClientProps {
  dreams: DreamOption[];
  conversations: ConversationListItemView[];
  current: ConversationView | null;
  selectedId: string | null;
  quota: { limit: number; used: number; remaining: number };
  selectableStyles: DreamBoard_DreamBoardStyle[];
}

const STYLE_ICON: Record<DreamBoard_DreamBoardStyle, LucideIcon> = {
  [DreamBoard_DreamBoardStyle.UNSPECIFIED]: Sparkles,
  [DreamBoard_DreamBoardStyle.PHOTOREAL]: Camera,
  [DreamBoard_DreamBoardStyle.PAINTERLY]: Paintbrush,
  [DreamBoard_DreamBoardStyle.SCRAPBOOK]: Scissors,
  [DreamBoard_DreamBoardStyle.CINEMATIC]: Clapperboard,
  [DreamBoard_DreamBoardStyle.WATERCOLOR]: Droplets,
};

const MAX_LONGEST_EDGE = 768;
const JPEG_QUALITY = 0.85;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

type AreaKey =
  | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
  | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
  | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
  | "enums.dream.areaOfLife.SPIRITUALITY"
  | "enums.dream.areaOfLife.LIFESTYLE";

type StyleKey =
  | "enums.dreamBoard.style.PHOTOREAL"
  | "enums.dreamBoard.style.PAINTERLY"
  | "enums.dreamBoard.style.SCRAPBOOK"
  | "enums.dreamBoard.style.CINEMATIC"
  | "enums.dreamBoard.style.WATERCOLOR";

export function DreamBoardClient({
  dreams,
  conversations,
  current,
  selectedId,
  quota,
  selectableStyles,
}: DreamBoardClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const conv: Conversation | null = useMemo(
    () =>
      current
        ? fromProtoJson(ConversationSchema, current.conversationJson)
        : null,
    [current],
  );

  const [isPending, startTransition] = useTransition();
  const [pickedDreams, setPickedDreams] = useState<Set<string>>(new Set());
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bubblesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPickedDreams(new Set());
  }, [conv?.id]);

  useEffect(() => {
    if (bubblesRef.current) {
      bubblesRef.current.scrollTop = bubblesRef.current.scrollHeight;
    }
  }, [conv?.messages.length, conv?.state]);

  const onNewChat = () => {
    startTransition(async () => {
      const result = await startNewChatAction();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      router.push(`/dashboard/dream-board?c=${result.data.id}`);
      router.refresh();
    });
  };

  const onSelectChat = (id: string) => {
    if (id === (selectedId ?? conv?.id)) return;
    router.push(`/dashboard/dream-board?c=${id}`);
  };

  const onDeleteChat = (id: string) => setDeleteTargetId(id);

  const onConfirmDelete = () => {
    const id = deleteTargetId;
    if (!id) return;
    setDeleteTargetId(null);
    startTransition(async () => {
      const result = await deleteConversationAction(id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(t("pages.dreamBoard.toast.deleted"));
      if (id === (selectedId ?? conv?.id)) {
        router.push("/dashboard/dream-board");
      } else {
        router.refresh();
      }
    });
  };

  const sendReply = (
    reply: Parameters<typeof replyToConversationAction>[1],
    onSuccess?: () => void,
  ) => {
    if (!conv) return;
    const id = conv.id;
    startTransition(async () => {
      const result = await replyToConversationAction(id, reply);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      onSuccess?.();
      router.refresh();
    });
  };

  const onStart = () => sendReply({ kind: "start" });
  const onSkipPhoto = () => sendReply({ kind: "skipPhoto" });
  const onBack = () => sendReply({ kind: "back" });

  const onConfirmDreams = () => {
    if (pickedDreams.size === 0) return;
    sendReply({ kind: "chooseDreams", dreamIds: [...pickedDreams] });
  };

  const onDreamCreated = (id: string) => {
    setPickedDreams((prev) => new Set(prev).add(id));
    router.refresh();
  };

  const onChooseStyle = (style: DreamBoard_DreamBoardStyle) =>
    sendReply({ kind: "chooseStyle", style });

  const onGenerate = () => {
    if (quota.remaining <= 0) {
      toast.error(
        t("pages.dreamBoard.toast.quotaExhausted", { limit: quota.limit }),
      );
      return;
    }
    sendReply({ kind: "generate" }, () =>
      toast.success(t("pages.dreamBoard.toast.generated")),
    );
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(t("pages.dreamBoard.toast.photoTooLarge"));
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error(t("pages.dreamBoard.toast.photoInvalidFormat"));
      return;
    }

    let dataUrl: string;
    try {
      dataUrl = await resizeToJpegDataUrl(file, MAX_LONGEST_EDGE, JPEG_QUALITY);
    } catch {
      toast.error(t("pages.dreamBoard.toast.photoReadFailed"));
      return;
    }

    sendReply({ kind: "uploadPhoto", dataUrl });
  };

  const onDownload = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `dream-board-${conv?.id ?? "image"}.png`;
      link.href = href;
      link.click();
      URL.revokeObjectURL(href);
    } catch {
      toast.error(t("pages.dreamBoard.toast.downloadFailed"));
    }
  };

  const dreamTitleById = useMemo(
    () => new Map(dreams.map((d) => [d.id, d.title])),
    [dreams],
  );

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "short" }),
    [locale],
  );

  const dreamsByArea = useMemo(() => {
    const grouped: Record<number, DreamOption[]> = {};
    for (const d of dreams) (grouped[d.areaOfLife] ??= []).push(d);
    return grouped;
  }, [dreams]);

  const toggleDream = (id: string) =>
    setPickedDreams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const composer = (
    <Composer
      quota={quota}
      isPending={isPending}
      state={conv?.state ?? null}
      ready={!!conv}
      t={t}
    >
      {!conv ? (
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
          <span className="truncate text-sm text-muted-foreground">
            {t("pages.dreamBoard.sidebar.empty")}
          </span>
          <Button
            onClick={onNewChat}
            disabled={isPending}
            size="sm"
            className="rounded-full active:scale-95 hover:shadow-sm"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <InputRow
          state={conv.state}
          dreams={dreams}
          dreamsByArea={dreamsByArea}
          pickedDreams={pickedDreams}
          togglePick={toggleDream}
          onDreamCreated={onDreamCreated}
          selectableStyles={selectableStyles}
          selectedDreamIds={conv.selectedDreamIds}
          dreamTitleById={dreamTitleById}
          selectedStyle={conv.selectedStyle}
          photoSkipped={conv.photoSkipped}
          quotaRemaining={quota.remaining}
          isPending={isPending}
          onStart={onStart}
          onPickFile={onPickFile}
          onSkipPhoto={onSkipPhoto}
          onConfirmDreams={onConfirmDreams}
          onChooseStyle={onChooseStyle}
          onBack={onBack}
          onGenerate={onGenerate}
          onNewChat={onNewChat}
          t={t}
        />
      )}
    </Composer>
  );

  return (
    <>
      <aside className="hidden px-2 w-64 shrink-0 flex-col border-r border-border bg-sidebar duration-500 animate-in fade-in slide-in-from-left-4 md:flex">
        <div className="py-3">
          <Button
            onClick={onNewChat}
            disabled={isPending}
            className="w-full justify-start rounded-md px-2 active:scale-[0.98]"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            {t("pages.dreamBoard.sidebar.newChat")}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              {t("pages.dreamBoard.sidebar.empty")}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((c) => {
                const isActive = c.id === (selectedId ?? conv?.id);
                return (
                  <li key={c.id}>
                    <div
                      className={cn(
                        "group flex items-start gap-2 rounded-xl p-2 transition-all duration-200 ease-out animate-in fade-in slide-in-from-left-2",
                        isActive
                          ? "bg-muted"
                          : "hover:bg-muted/60 hover:translate-x-0.5",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectChat(c.id)}
                        className="flex min-w-0 flex-1 items-start gap-2 text-left"
                      >
                        {c.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.imageUrl}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Sparkles className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                            {c.createdAtMs
                              ? dateFormatter.format(new Date(c.createdAtMs))
                              : ""}
                          </p>
                          <p className="line-clamp-2 text-sm text-foreground">
                            {c.preview}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteChat(c.id)}
                        disabled={isPending}
                        className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-all duration-200 hover:bg-muted hover:text-destructive hover:scale-110 group-hover:opacity-100"
                        aria-label={t("pages.dreamBoard.sidebar.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section className="relative flex flex-1 flex-col">
        {!conv ? (
          <>
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm duration-700 animate-in fade-in zoom-in-75"
                style={{ animationDelay: "60ms", animationFillMode: "both" }}
              >
                <Sparkles className="h-6 w-6 animate-pulse [animation-duration:3s]" />
              </div>
              <h2
                className="mt-6 text-3xl font-semibold tracking-tight text-foreground duration-700 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: "180ms", animationFillMode: "both" }}
              >
                {t("pages.dreamBoard.title")}
              </h2>
              <p
                className="mt-2 max-w-md text-sm text-muted-foreground duration-700 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: "300ms", animationFillMode: "both" }}
              >
                {t("pages.dreamBoard.description")}
              </p>
            </div>
            <div className="px-4 pb-6 sm:px-6 sm:pb-8">
              <div
                className="mx-auto w-full max-w-2xl duration-700 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: "420ms", animationFillMode: "both" }}
              >
                {composer}
              </div>
            </div>
          </>
        ) : (
          <>
            <div ref={bubblesRef} className="flex-1 overflow-y-auto">
              <div className="w-full space-y-3 px-4 py-8 sm:px-6">
                {conv.messages.map((msg, idx) => {
                  const isLastMessage = idx === conv.messages.length - 1;
                  const isFailed =
                    isLastMessage &&
                    conv.state === Conversation_ConversationState.FAILED &&
                    msg.role === Conversation_MessageRole.BOT;
                  return (
                    <ChatBubble
                      key={idx}
                      role={msg.role}
                      text={renderMessage(t, msg.key, msg.params)}
                      failed={isFailed}
                    />
                  );
                })}

                {conv.state === Conversation_ConversationState.DONE &&
                  current?.imageUrl && (
                    <BoardCard
                      imageUrl={current.imageUrl}
                      style={conv.selectedStyle}
                      styleLabel={t(
                        `enums.dreamBoard.style.${DREAM_BOARD_STYLE_LABELS[conv.selectedStyle]}` as StyleKey,
                      )}
                      onDownload={() => onDownload(current.imageUrl!)}
                      t={t}
                    />
                  )}

                {conv.state === Conversation_ConversationState.GENERATING && (
                  <div className="flex items-end gap-2.5 duration-300 animate-in fade-in slide-in-from-bottom-2">
                    <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md ring-2 ring-background">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border/70 bg-card px-4 py-3.5 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms] [animation-duration:1.2s]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:200ms] [animation-duration:1.2s]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:400ms] [animation-duration:1.2s]" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 px-4 pb-6 sm:px-6 sm:pb-8">
              <div className="w-full duration-500 animate-in fade-in slide-in-from-bottom-4">
                {composer}
              </div>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFileChange}
        />
      </section>

      <Dialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
          <div className="flex flex-col items-center gap-4 px-6 pb-2 pt-8 text-center">
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-lg font-semibold">
                {t("pages.dreamBoard.deleteModal.title")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("pages.dreamBoard.deleteModal.description")}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="flex-col gap-2 px-6 pb-6 pt-4 sm:flex-col sm:space-x-0">
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isPending}
              className="w-full rounded-lg font-medium shadow-sm active:scale-[0.98]"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("pages.dreamBoard.deleteModal.confirm")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteTargetId(null)}
              disabled={isPending}
              className="w-full rounded-lg"
            >
              {t("pages.dreamBoard.deleteModal.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Composer({
  quota,
  state,
  ready,
  isPending,
  t,
  children,
}: {
  quota: { limit: number; remaining: number };
  state: Conversation_ConversationState | null;
  ready: boolean;
  isPending: boolean;
  t: ReturnType<typeof useTranslations>;
  children: React.ReactNode;
}) {
  const statusLabel = !ready
    ? t("pages.dreamBoard.sidebar.newChat")
    : state === Conversation_ConversationState.GENERATING || isPending
      ? t("pages.dreamBoard.chat.messages.generating")
      : t("pages.dreamBoard.chat.composerPlaceholder");

  const statusDot =
    state === Conversation_ConversationState.GENERATING || isPending
      ? "bg-amber-500"
      : "bg-emerald-500";

  const isBusy =
    state === Conversation_ConversationState.GENERATING || isPending;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur transition-all duration-300 focus-within:shadow-md hover:shadow-md supports-[backdrop-filter]:bg-card/70">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 transition-transform duration-300 hover:scale-110" />
          {t("pages.dreamBoard.chat.remaining", {
            remaining: quota.remaining,
            limit: quota.limit,
          })}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex h-2 w-2 items-center justify-center">
            {isBusy && (
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping",
                  statusDot,
                )}
              />
            )}
            <span
              className={cn(
                "relative inline-flex h-1.5 w-1.5 rounded-full transition-colors duration-300",
                statusDot,
              )}
            />
          </span>
          <span
            key={statusLabel}
            className="truncate duration-300 animate-in fade-in"
          >
            {statusLabel}
          </span>
        </span>
      </div>
      <div
        key={state ?? "empty"}
        className="duration-300 animate-in fade-in slide-in-from-bottom-1"
      >
        {children}
      </div>
    </div>
  );
}

function ChatBubble({
  role,
  text,
  failed = false,
}: {
  role: Conversation_MessageRole;
  text: string;
  failed?: boolean;
}) {
  const isBot = role === Conversation_MessageRole.BOT;
  return (
    <div
      className={cn(
        "flex items-end gap-2.5 duration-300 animate-in fade-in slide-in-from-bottom-2",
        isBot ? "justify-start" : "justify-end",
      )}
    >
      {isBot && (
        <div
          className={cn(
            "mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-md ring-2 ring-background",
            failed
              ? "bg-destructive/90"
              : "bg-gradient-to-br from-violet-500 to-indigo-600",
          )}
        >
          {failed ? (
            <AlertTriangle className="h-3.5 w-3.5 text-destructive-foreground" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-white" />
          )}
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          isBot &&
            !failed &&
            "rounded-2xl rounded-bl-sm border border-border/70 bg-card text-foreground",
          isBot &&
            failed &&
            "rounded-2xl rounded-bl-sm border border-destructive/30 bg-destructive/10 text-destructive",
          !isBot && "rounded-2xl rounded-br-sm bg-foreground text-background",
        )}
      >
        {text}
      </div>
    </div>
  );
}

function BoardCard({
  imageUrl,
  styleLabel,
  onDownload,
  t,
}: {
  imageUrl: string;
  style: DreamBoard_DreamBoardStyle;
  styleLabel: string;
  onDownload: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex items-end gap-2.5 duration-500 animate-in fade-in slide-in-from-bottom-3">
      <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md ring-2 ring-background">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="group w-full max-w-md overflow-hidden rounded-2xl rounded-bl-sm border border-border/70 bg-card shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <button
            type="button"
            onClick={onDownload}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-black shadow-lg opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 group-hover:opacity-100"
          >
            <Download className="h-3.5 w-3.5" />
            {t("pages.dreamBoard.chat.actions.download")}
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">
            {t("pages.dreamBoard.chat.boardCard.styleLabel", {
              style: styleLabel,
            })}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDownload}
            className="h-7 rounded-full px-2.5 text-xs active:scale-95 md:hidden"
          >
            <Download className="mr-1 h-3 w-3" />
            {t("pages.dreamBoard.chat.actions.download")}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface InputRowProps {
  state: Conversation_ConversationState;
  dreams: DreamOption[];
  dreamsByArea: Record<number, DreamOption[]>;
  pickedDreams: Set<string>;
  togglePick: (id: string) => void;
  onDreamCreated: (id: string) => void;
  selectableStyles: DreamBoard_DreamBoardStyle[];
  selectedDreamIds: string[];
  dreamTitleById: Map<string, string>;
  selectedStyle: DreamBoard_DreamBoardStyle;
  photoSkipped: boolean;
  quotaRemaining: number;
  isPending: boolean;
  onStart: () => void;
  onPickFile: () => void;
  onSkipPhoto: () => void;
  onConfirmDreams: () => void;
  onChooseStyle: (s: DreamBoard_DreamBoardStyle) => void;
  onBack: () => void;
  onGenerate: () => void;
  onNewChat: () => void;
  t: ReturnType<typeof useTranslations>;
}

function InputRow(props: InputRowProps) {
  const { state, isPending, t } = props;

  switch (state) {
    case Conversation_ConversationState.GREETING:
      return (
        <RowShell hint={t("pages.dreamBoard.chat.composerPlaceholder")}>
          <Button
            onClick={props.onStart}
            disabled={isPending}
            size="sm"
            className="rounded-full active:scale-95 hover:shadow-sm"
          >
            {t("pages.dreamBoard.chat.actions.start")}
            <ArrowUp className="ml-1 h-4 w-4" />
          </Button>
        </RowShell>
      );

    case Conversation_ConversationState.ASK_PHOTO:
      return (
        <RowShell hint={t("pages.dreamBoard.chat.photoHint")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={props.onSkipPhoto}
            disabled={isPending}
            className="rounded-full active:scale-95 hover:shadow-sm"
          >
            {t("pages.dreamBoard.chat.actions.skipPhoto")}
          </Button>
          <Button
            onClick={props.onPickFile}
            disabled={isPending}
            size="sm"
            className="rounded-full active:scale-95 hover:shadow-sm"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {t("pages.dreamBoard.chat.actions.uploadPhoto")}
          </Button>
        </RowShell>
      );

    case Conversation_ConversationState.ASK_DREAMS:
      return (
        <div className="px-4 py-3">
          {props.dreams.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("pages.dreams.empty.message")}
            </p>
          ) : (
            <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
              {SELECTABLE_DREAM_AREAS_OF_LIFE.map((area) => {
                const list = props.dreamsByArea[area] ?? [];
                if (list.length === 0) return null;
                return (
                  <div key={area} className="space-y-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {t(
                        `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[area]}` as AreaKey,
                      )}
                    </h3>
                    <ul className="space-y-1.5">
                      {list.map((d) => {
                        const checked = props.pickedDreams.has(d.id);
                        return (
                          <li
                            key={d.id}
                            className="flex items-start gap-2 rounded-md p-1 transition-colors hover:bg-muted/40"
                          >
                            <Checkbox
                              id={`pick-${d.id}`}
                              checked={checked}
                              onCheckedChange={() => props.togglePick(d.id)}
                              className="mt-0.5"
                            />
                            <label
                              htmlFor={`pick-${d.id}`}
                              className="cursor-pointer text-sm text-foreground"
                            >
                              {d.title || t("pages.dreams.form.untitled")}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between gap-2">
            <NewDreamDialog
              onCreated={props.onDreamCreated}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  className="rounded-full active:scale-95 hover:shadow-sm"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {t("pages.dreamBoard.chat.actions.newDream")}
                </Button>
              }
            />
            <Button
              onClick={props.onConfirmDreams}
              disabled={isPending || props.pickedDreams.size === 0}
              size="sm"
              className="rounded-full active:scale-95 hover:shadow-sm"
            >
              {t("pages.dreamBoard.chat.actions.confirmDreams")}
              <ArrowUp className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      );

    case Conversation_ConversationState.ASK_STYLE:
      return (
        <div className="grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-3">
          {props.selectableStyles.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => props.onChooseStyle(s)}
              disabled={isPending}
              className="group flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-background/60 px-3 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-background hover:shadow-md active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 animate-in fade-in slide-in-from-bottom-1 [animation-duration:300ms]"
              style={{
                animationDelay: `${i * 60}ms`,
                animationFillMode: "both",
              }}
            >
              {(() => {
                const I = STYLE_ICON[s] ?? Sparkles;
                return <I className="h-5 w-5" />;
              })()}
              <span className="text-xs font-medium text-foreground">
                {t(
                  `enums.dreamBoard.style.${DREAM_BOARD_STYLE_LABELS[s]}` as StyleKey,
                )}
              </span>
            </button>
          ))}
        </div>
      );

    case Conversation_ConversationState.CONFIRM: {
      const titles = props.selectedDreamIds
        .map((id) => props.dreamTitleById.get(id))
        .filter((v): v is string => !!v);
      const styleLabel = t(
        `enums.dreamBoard.style.${DREAM_BOARD_STYLE_LABELS[props.selectedStyle]}` as StyleKey,
      );
      return (
        <div className="flex flex-col gap-3 px-4 py-3">
          <Card className="border-border/60 bg-background/60 shadow-none duration-300 animate-in fade-in zoom-in-95">
            <CardContent className="p-3 space-y-2.5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("pages.dreamBoard.chat.confirm.dreamsCount", {
                    count: props.selectedDreamIds.length,
                  })}
                </p>
                {titles.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {titles.map((title) => (
                      <span
                        key={title}
                        className="inline-flex items-center rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[11px] text-foreground"
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Separator className="opacity-50" />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground/70">
                    Style:{" "}
                  </span>
                  {styleLabel}
                </span>
                <span>
                  {props.photoSkipped
                    ? t("pages.dreamBoard.chat.confirm.withoutPhoto")
                    : t("pages.dreamBoard.chat.confirm.withPhoto")}
                </span>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onBack}
              disabled={isPending}
              className="rounded-full active:scale-95 hover:shadow-sm"
            >
              {t("pages.dreamBoard.chat.actions.back")}
            </Button>
            <Button
              onClick={props.onGenerate}
              disabled={isPending || props.quotaRemaining <= 0}
              size="sm"
              className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/25 active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {t("pages.dreamBoard.chat.actions.generate")}
            </Button>
          </div>
        </div>
      );
    }

    case Conversation_ConversationState.GENERATING:
      return (
        <div className="flex items-center justify-center gap-3 px-4 py-4 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms] [animation-duration:1.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:200ms] [animation-duration:1.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:400ms] [animation-duration:1.2s]" />
          </div>
          <span className="animate-pulse [animation-duration:2s]">
            {t("pages.dreamBoard.chat.messages.generating")}
          </span>
        </div>
      );

    case Conversation_ConversationState.DONE:
    case Conversation_ConversationState.FAILED:
      return (
        <RowShell hint={t("pages.dreamBoard.chat.composerPlaceholder")}>
          <Button
            onClick={props.onNewChat}
            disabled={isPending}
            size="sm"
            className="rounded-full active:scale-95 hover:shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {t("pages.dreamBoard.chat.actions.newChat")}
          </Button>
        </RowShell>
      );

    default:
      return (
        <div className="px-4 py-3 text-center text-xs text-muted-foreground">
          {t("pages.dreamBoard.chat.composerPlaceholder")}
        </div>
      );
  }
}

function RowShell({
  hint,
  children,
}: {
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <MessageSquarePlus className="h-4 w-4 shrink-0" />
        <span className="truncate">{hint}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

function renderMessage(
  t: ReturnType<typeof useTranslations>,
  key: string,
  params: Record<string, string>,
): string {
  if (!key) return "";
  if (params.styleLabelKey) {
    const styleLabel = t(
      `enums.dreamBoard.style.${params.styleLabelKey}` as StyleKey,
    );
    return `${t(key as Parameters<typeof t>[0])} — ${styleLabel}`;
  }
  return t(key as Parameters<typeof t>[0], params);
}

async function resizeToJpegDataUrl(
  file: File,
  maxEdge: number,
  quality: number,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not available.");
    ctx.drawImage(bitmap, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    bitmap.close();
  }
}
