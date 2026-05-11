"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { createClient } from "@/shared/supabase/client";

import { uploadAvatarAction } from "./actions";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

interface Props {
  userId: string;
  displayName: string;
  currentAvatarUrl?: string | null;
}

export function AvatarUploadForm({ userId, displayName, currentAvatarUrl }: Props) {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setSuccess(false);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t("pages.account.avatar.invalidFormat"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t("pages.account.avatar.tooLarge"));
      return;
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    startTransition(async () => {
      const supabase = createClient();

      const { data: existing } = await supabase.storage
        .from("avatars")
        .list(userId);
      if (existing && existing.length > 0) {
        await supabase.storage
          .from("avatars")
          .remove(existing.map((f) => `${userId}/${f.name}`));
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

      const result = await uploadAvatarAction(avatarUrl);
      if (result.ok) {
        setPreview(avatarUrl);
        setSuccess(true);
      } else {
        setError(result.message);
      }
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.account.avatar.title")}</CardTitle>
        <CardDescription>{t("pages.account.avatar.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div
            className="relative cursor-pointer group"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Avatar className="h-20 w-20">
              <AvatarImage src={preview ?? undefined} alt={displayName} className="object-cover" />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">{t("pages.account.avatar.change")}</span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => inputRef.current?.click()}
            >
              {isPending ? t("pages.account.avatar.uploading") : t("pages.account.avatar.upload")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("pages.account.avatar.hint")}</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {t("pages.account.avatar.success")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
