import { DreamBoard_DreamBoardStyle } from "@/modules/dream_board/proto/v1/dream_board_pb";

/**
 * UI-facing metadata for the DreamBoardStyle enum. Mirrors the Dreams module
 * pattern — translation keys and the selectable subset live here so the
 * `.proto` stays schema-only.
 *
 * Translation keys: UI joins with `enums.dreamBoard.style.<key>`.
 */

export const DREAM_BOARD_STYLE_LABELS: Record<
  DreamBoard_DreamBoardStyle,
  string
> = {
  [DreamBoard_DreamBoardStyle.UNSPECIFIED]: "UNSPECIFIED",
  [DreamBoard_DreamBoardStyle.PHOTOREAL]: "PHOTOREAL",
  [DreamBoard_DreamBoardStyle.PAINTERLY]: "PAINTERLY",
  [DreamBoard_DreamBoardStyle.SCRAPBOOK]: "SCRAPBOOK",
  [DreamBoard_DreamBoardStyle.CINEMATIC]: "CINEMATIC",
  [DreamBoard_DreamBoardStyle.WATERCOLOR]: "WATERCOLOR",
};

export const SELECTABLE_DREAM_BOARD_STYLES: readonly DreamBoard_DreamBoardStyle[] =
  [
    DreamBoard_DreamBoardStyle.PHOTOREAL,
    DreamBoard_DreamBoardStyle.PAINTERLY,
    DreamBoard_DreamBoardStyle.SCRAPBOOK,
    DreamBoard_DreamBoardStyle.CINEMATIC,
    DreamBoard_DreamBoardStyle.WATERCOLOR,
  ] as const;

export const isDreamBoardStyle = (
  value: unknown,
): value is DreamBoard_DreamBoardStyle =>
  typeof value === "number" && value in DREAM_BOARD_STYLE_LABELS;
