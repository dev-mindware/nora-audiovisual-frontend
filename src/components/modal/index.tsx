"use client";

import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { IconCheckSucessfull } from "./icon-success";
import { IconWarning } from "./icon-warning";
import { useModal } from "@/stores/modal/use-modal-store";

export type ModalSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

export interface ModalProps {
  id?: string;
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string | ReactNode;
  description?: string | ReactNode;
  icon?: ReactNode;
  headerExtra?: ReactNode;
  hideHeader?: boolean;
  canClose?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: ModalSize;
  sucess?: boolean;
  warning?: boolean;
}

const MODAL_SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-[95vw] md:max-w-6xl",
};

export function GlobalModal({
  id,
  isOpen,
  open: controlledOpen,
  onClose,
  onOpenChange,
  title,
  sucess,
  warning,
  description,
  icon,
  headerExtra,
  hideHeader = false,
  canClose = true,
  children,
  footer,
  className,
  size = "lg",
}: ModalProps) {
  const modalStore = useModal();

  const isModalOpen =
    isOpen !== undefined
      ? isOpen
      : controlledOpen !== undefined
        ? controlledOpen
        : id
          ? modalStore.open[id] || false
          : false;

  const handleOpenChange = (openState: boolean) => {
    if (!openState) {
      onClose?.();
      onOpenChange?.(false);

      if (id && canClose) {
        modalStore.closeModal(id);
      }

      return;
    }

    onOpenChange?.(true);
  };

  const sizeClass = MODAL_SIZE_CLASSES[size] || MODAL_SIZE_CLASSES.lg;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          // Estrutura principal
          "flex flex-col",

          // Dimensões
          "w-[calc(100%-2rem)]",
          "max-h-[90dvh]",

          // Aparência
          "rounded-2xl",
          "border-border",
          "bg-card",
          "text-foreground",
          "shadow-2xl",

          // Remove o overflow do modal inteiro.
          // O scroll ficará apenas no conteúdo.
          "overflow-hidden",

          // Espaçamento
          "p-4 sm:p-6",

          sizeClass,
          className
        )}
        onInteractOutside={(event) => {
          if (!canClose) {
            event.preventDefault();
          }
        }}
      >
        {canClose && (
          <DialogClose
            onClick={() => {
              onClose?.();

              if (id) {
                modalStore.closeModal(id);
              }
            }}
          />
        )}

        {!hideHeader &&
          (title || description || icon || headerExtra) && (
            <DialogHeader
              className={cn(
                "relative shrink-0",
                "space-y-1",
                "border-b border-border/40",
                "pb-3"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className={cn("flex min-w-0 items-center gap-3", {
                    "w-full flex-col text-center": sucess,
                  })}
                >
                  {sucess && <IconCheckSucessfull />}

                  {warning && <IconWarning />}

                  {icon && !sucess && !warning && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {icon}
                    </div>
                  )}

                  <div
                    className={cn("min-w-0 space-y-0.5 text-left", {
                      "text-center": sucess,
                    })}
                  >
                    {title && (
                      <DialogTitle
                        className={cn(
                          "text-lg font-semibold tracking-tight",
                          "text-foreground",
                          "break-words"
                        )}
                      >
                        {title}
                      </DialogTitle>
                    )}

                    {description && (
                      <DialogDescription className="text-xs text-muted-foreground">
                        {description}
                      </DialogDescription>
                    )}
                  </div>
                </div>

                {headerExtra && (
                  <div className="shrink-0">
                    {headerExtra}
                  </div>
                )}
              </div>
            </DialogHeader>
          )}

        {/*
          Conteúdo:

          - flex-1 ocupa o espaço disponível
          - min-h-0 permite que o elemento encolha dentro do modal
          - overflow-y-auto faz apenas esta área ter scroll

          Desta forma, o footer nunca desaparece para baixo.
        */}
        <div
          className={cn(
            "min-h-0 flex-1",
            "overflow-y-auto",
            "py-3"
          )}
        >
          {children}
        </div>

        {/*
          Footer:

          - shrink-0 impede que seja comprimido
          - mt-auto garante que fique no fundo quando existe
            espaço vertical disponível
          - justify-end coloca todos os botões no canto direito
          - flex-wrap permite adaptar-se a vários botões
        */}
        {footer && (
          <DialogFooter
            className={cn(
              "mt-auto shrink-0",
              "border-t border-border/40",
              "pt-4",
              "flex flex-row flex-wrap items-center justify-end gap-2",
              "[&>button]:w-full",
              "[&>button]:max-w-[180px]",
              "sm:[&>button]:w-auto"
            )}
          >
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export * from "./subscription-modal";
