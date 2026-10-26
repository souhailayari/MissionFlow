import { BadgeCheck, Bell, CircleX, Clock3, Send, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/types/notifications";

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

const presentationByType: Record<string, { label: string; Icon: LucideIcon; tone: string }> = {
  MISSION_SUBMITTED: { label: "Nouvelle demande", Icon: Send, tone: "info" },
  MISSION_PENDING: { label: "À valider", Icon: Clock3, tone: "warning" },
  MISSION_APPROVED: { label: "Validation", Icon: BadgeCheck, tone: "success" },
  MISSION_REJECTED: { label: "Rejet", Icon: CircleX, tone: "danger" },
};

const iconToneClasses: Record<string, string> = {
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  neutral: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
};

const labelToneClasses: Record<string, string> = {
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  neutral: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
};

type NotificationItemProps = Readonly<{
  notification: Notification;
  disabled?: boolean;
  onOpen: () => void;
  onMarkAsRead: () => void;
}>;

export function NotificationItem({ notification, disabled = false, onOpen, onMarkAsRead }: NotificationItemProps) {
  const isUnread = !notification.readAt;
  const presentation = presentationByType[notification.type] ?? { label: "Notification", Icon: Bell, tone: "neutral" };
  const Icon = presentation.Icon;

  return (
    <li>
      <article className={`group rounded-2xl border p-4 shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform,background-color] hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-[0_10px_24px_rgba(16,26,51,0.08)] sm:p-5 ${isUnread ? "border-l-[3px] border-l-[var(--brand)] border-[var(--brand)]/20 bg-[var(--brand-soft)]/25" : "border-[var(--line)] bg-[var(--surface)]"}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span aria-hidden="true" className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconToneClasses[presentation.tone]}`}>
            <Icon className="h-[18px] w-[18px]" />
          </span>

          <button
            type="button"
            onClick={onOpen}
            disabled={disabled}
            className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]/60 disabled:cursor-wait"
            aria-label={notification.missionId ? `${notification.title}, ouvrir la mission` : notification.title}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className={`text-sm leading-5 ${isUnread ? "font-bold text-[var(--text)]" : "font-semibold text-[var(--text-soft)]"}`}>
                {notification.title}
              </h2>
              {isUnread && <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--brand-strong)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />Non lue</span>}
            </div>
            <p className="mt-1.5 text-sm leading-5 text-[var(--text-soft)]">{notification.message}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold ${labelToneClasses[presentation.tone]}`}>
                {presentation.label}
              </span>
              <time dateTime={notification.createdAt} className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDateTime(notification.createdAt)}
              </time>
            </div>
          </button>

          {isUnread && (
            <Button size="sm" variant="outline" disabled={disabled} onClick={onMarkAsRead} className="self-end sm:self-auto">
              Marquer comme lue
            </Button>
          )}
        </div>
      </article>
    </li>
  );
}
