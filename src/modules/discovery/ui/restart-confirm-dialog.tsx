"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface RestartConfirmDialogProps {
  open: boolean;
  answersCount: number;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RestartConfirmDialog({
  open,
  answersCount,
  isPending,
  onOpenChange,
  onConfirm,
}: RestartConfirmDialogProps) {
  const t = useTranslations();
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              <AlertDialogPrimitive.Overlay forceMount asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                />
              </AlertDialogPrimitive.Overlay>

              <AlertDialogPrimitive.Content forceMount asChild>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900/95 via-slate-900/95 to-slate-950/95 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl"
                  >
                    {/* subtle glow accent */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl"
                    />

                    <div className="relative flex flex-col items-center text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 ring-1 ring-rose-400/30">
                        <AlertTriangle className="h-6 w-6 text-rose-300" />
                      </div>

                      <AlertDialogPrimitive.Title className="font-serif text-xl text-white">
                        {t("pages.discovery.restartDialog.title")}
                      </AlertDialogPrimitive.Title>

                      <AlertDialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-white/60">
                        {answersCount > 0
                          ? t.rich(
                              answersCount === 1
                                ? "pages.discovery.restartDialog.descriptionWithAnswersOne"
                                : "pages.discovery.restartDialog.descriptionWithAnswersMany",
                              {
                                count: answersCount,
                                strong: (chunks) => (
                                  <span className="font-medium text-white/80">
                                    {chunks}
                                  </span>
                                ),
                              },
                            )
                          : t("pages.discovery.restartDialog.descriptionEmpty")}
                      </AlertDialogPrimitive.Description>
                    </div>

                    <div className="relative mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <AlertDialogPrimitive.Cancel
                        disabled={isPending}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
                      >
                        {t("pages.discovery.restartDialog.keep")}
                      </AlertDialogPrimitive.Cancel>
                      <AlertDialogPrimitive.Action
                        disabled={isPending}
                        onClick={(e) => {
                          e.preventDefault();
                          onConfirm();
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 text-sm font-medium text-white shadow-lg shadow-rose-500/20 transition-colors hover:bg-rose-400 disabled:opacity-60"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("pages.discovery.restartDialog.restarting")}
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4" />
                            {t("pages.discovery.restartDialog.confirm")}
                          </>
                        )}
                      </AlertDialogPrimitive.Action>
                    </div>
                  </motion.div>
                </div>
              </AlertDialogPrimitive.Content>
            </>
          )}
        </AnimatePresence>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
