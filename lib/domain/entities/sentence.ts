import type { Json } from "@/lib/supabase/database.types";

export class Sentence {
  public id: string;
  public text: string;
  public lastUsedAt: string | null;
  public version: number;
  public createdAt: string;
  public updatedAt: string;
  public deletedAt: string | null = null;

  constructor(
    id: string,
    text: string,
    lastUsedAt: string | null,
    version: number,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.text = text;
    this.lastUsedAt = lastUsedAt;
    this.version = version;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toDbJson(): Json {
    return {
      id: this.id,
      text: this.text,
      last_used_at: this.lastUsedAt,
      version: this.version,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      deleted_at: this.deletedAt,
    };
  }
}
