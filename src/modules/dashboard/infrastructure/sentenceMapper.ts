import type { Database, Json } from "@/shared/supabase/database.types";

import { Sentence, SentenceProps } from "../domain/Sentence";

type SentenceRow = Database["public"]["Tables"]["sentences"]["Row"];

interface SentenceData {
  text: string;
}

const isSentenceData = (value: Json): value is SentenceData & {
  [k: string]: Json | undefined;
} => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return typeof (value as { text?: unknown }).text === "string";
};

export const toSentence = (row: SentenceRow): Sentence => {
  if (!isSentenceData(row.data)) {
    throw new Error(`Corrupt sentence row ${row.id}: missing text.`);
  }
  const props: SentenceProps = {
    id: row.id,
    text: row.data.text,
    lastUsedAt: row.last_used_at,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
  return Sentence.rehydrate(props);
};
