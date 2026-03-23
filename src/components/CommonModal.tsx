import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CommonModalProps = {
  open: boolean;
  onClose?: () => void;
  title: string;
  description?: ReactNode;
  actionLabel: string;
  onAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: ReactNode;
  note?: ReactNode;
  children?: ReactNode;
  className?: string;
  overlayClassName?: string;
  actionClassName?: string;
  secondaryActionClassName?: string;
  closeOnBackdropClick?: boolean;
};

export default function CommonModal({
  open,
  onClose,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon = "🎉",
  note,
  children,
  className,
  overlayClassName,
  actionClassName,
  secondaryActionClassName,
  closeOnBackdropClick = true,
}: CommonModalProps) {
  if (!open) return null;

  const handleOverlayClick = () => {
    if (closeOnBackdropClick) onClose?.();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center px-6 py-8",
        overlayClassName,
      )}>
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-[0_30px_90px_-42px_rgba(15,23,42,0.75)]",
          className,
        )}>
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-primary/25 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-16 h-56 w-56 rounded-full bg-gradient-to-tl from-emerald-200/60 to-transparent blur-2xl" />

        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <span className="text-2xl">{icon}</span>
        </div>

        <p className="relative mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          {title}
        </p>
        <p className="relative mt-4 whitespace-pre-line text-[15px] leading-6 text-slate-600">
          {description}
        </p>

        {note && (
          <div className="relative mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {note}
          </div>
        )}

        {children}

        <div className="relative mt-6 flex gap-2">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className={cn(
                "w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50",
                secondaryActionClassName,
              )}>
              {secondaryActionLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onAction}
            className={cn(
              "w-full rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:brightness-95",
              actionClassName,
            )}>
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
