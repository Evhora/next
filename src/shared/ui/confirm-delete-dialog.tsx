"use client";

import { type ReactNode, useState } from "react";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

interface ConfirmDeleteDialogProps {
  trigger?: ReactNode;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmDeleteDialog({
  trigger,
  title = "Tem certeza?",
  description,
  confirmLabel = "Sim, excluir",
  cancelLabel = "Cancelar",
  onConfirm,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ConfirmDeleteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
        <div className="flex flex-col items-center gap-4 px-6 pb-2 pt-8 text-center">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="flex-col gap-2 px-6 pb-6 pt-4 sm:flex-col sm:space-x-0">
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="w-full rounded-lg font-medium shadow-sm active:scale-[0.98]"
          >
            {confirmLabel}
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-lg"
            onClick={() => setOpen(false)}
          >
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
