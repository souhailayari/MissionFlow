"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { listNotifications, markNotificationAsRead } from "@/lib/api/notifications";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationsWelcome } from "@/components/notifications/notifications-welcome";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import type { Notification } from "@/types/notifications";

type NotificationFilter = "all" | "unread" | "read";
type NotificationGroupKey = "today" | "week" | "older";

const notificationGroupLabels: Record<NotificationGroupKey, string> = {
  today: "Aujourd’hui",
  week: "Cette semaine",
  older: "Plus anciennes",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const loadNotifications = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await listNotifications();
      setNotifications(response.data);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Impossible de charger les notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadNotifications(), 0);
    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  const markAsRead = async (notification: Notification): Promise<boolean> => {
    if (notification.readAt) return true;
    setActionError(null);
    try {
      const response = await markNotificationAsRead(notification.id);
      setNotifications((current) => current.map((item) => item.id === notification.id ? response.data : item));
      window.dispatchEvent(new CustomEvent("notifications:updated"));
      return true;
    } catch (requestError) {
      setActionError(requestError instanceof ApiError ? requestError.message : "Impossible de marquer cette notification comme lue.");
      return false;
    }
  };

  const openNotification = async (notification: Notification) => {
    if (!await markAsRead(notification)) return;
    if (notification.missionId) router.push(`/missions/${notification.missionId}`);
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.readAt);
    if (unreadNotifications.length === 0 || isMarkingAllRead) return;

    setActionError(null);
    setIsMarkingAllRead(true);
    try {
      const results = await Promise.allSettled(unreadNotifications.map((notification) => markNotificationAsRead(notification.id)));
      const updatedNotifications = new Map<string, Notification>();
      let firstError: unknown;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          updatedNotifications.set(unreadNotifications[index].id, result.value.data);
        } else if (firstError === undefined) {
          firstError = result.reason;
        }
      });

      if (updatedNotifications.size > 0) {
        setNotifications((current) => current.map((notification) => updatedNotifications.get(notification.id) ?? notification));
        window.dispatchEvent(new CustomEvent("notifications:updated"));
      }

      if (firstError !== undefined) {
        setActionError(firstError instanceof ApiError ? firstError.message : "Certaines notifications n'ont pas pu être marquées comme lues.");
      }
    } catch (requestError) {
      setActionError(requestError instanceof ApiError ? requestError.message : "Impossible de marquer les notifications comme lues.");
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;
  const readCount = notifications.length - unreadCount;
  const visibleNotifications = notifications.filter((notification) =>
    filter === "all" || (filter === "unread" ? !notification.readAt : Boolean(notification.readAt)),
  );
  const filterOptions: Array<{ value: NotificationFilter; label: string; count: number }> = [
    { value: "all", label: "Toutes", count: notifications.length },
    { value: "unread", label: "Non lues", count: unreadCount },
    { value: "read", label: "Lues", count: readCount },
  ];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  const groupedNotifications: Array<{ key: NotificationGroupKey; label: string; items: Notification[] }> = [
    { key: "today", label: notificationGroupLabels.today, items: [] },
    { key: "week", label: notificationGroupLabels.week, items: [] },
    { key: "older", label: notificationGroupLabels.older, items: [] },
  ];

  visibleNotifications.forEach((notification) => {
    const createdAt = new Date(notification.createdAt);
    const group = Number.isNaN(createdAt.getTime()) || createdAt < startOfWeek
      ? groupedNotifications[2]
      : createdAt < startOfToday
        ? groupedNotifications[1]
        : groupedNotifications[0];
    group.items.push(notification);
  });

  return <PageContainer>
      <NotificationsWelcome unreadCount={unreadCount} isLoading={isLoading} isMarkingAllRead={isMarkingAllRead} onMarkAllAsRead={() => void markAllAsRead()} />
      {actionError && <Alert tone="danger" role="alert">{actionError}</Alert>}
      {!isLoading && !error && notifications.length > 0 && <div role="group" aria-label="Filtrer les notifications" className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-1">
          {filterOptions.map((option) => <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${filter === option.value ? "bg-[var(--surface)] text-[var(--brand-strong)] shadow-sm" : "text-[var(--text-soft)] hover:bg-[var(--surface)]/70 hover:text-[var(--text)]"}`}
          >
            {option.label}<span className={`tabular-nums ${filter === option.value ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`}>{option.count}</span>
          </button>)}
      </div>}
      {isLoading && <div className="space-y-3"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div>}
      {!isLoading && !error && notifications.length === 0 && <EmptyState title="Aucune notification" description="Les mises à jour de vos missions apparaîtront ici." />}
      {!isLoading && error && <div><ErrorState title="Notifications indisponibles" message={error} /><Button type="button" size="sm" variant="outline" onClick={() => void loadNotifications()}>Réessayer</Button></div>}
      {!isLoading && !error && notifications.length > 0 && visibleNotifications.length === 0 && <EmptyState
        title={filter === "unread" ? "Aucune notification non lue" : "Aucune notification lue"}
        description="Choisissez un autre filtre pour consulter le reste de votre activité."
      />}
      {!isLoading && !error && visibleNotifications.length > 0 && <div className="space-y-6">
        {groupedNotifications.filter((group) => group.items.length > 0).map((group) => <section key={group.key} aria-labelledby={`notifications-${group.key}`} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 id={`notifications-${group.key}`} className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">{group.label}</h2>
            <span aria-hidden="true" className="h-px flex-1 bg-[var(--line)]" />
          </div>
          <ul className="space-y-2.5">
            {group.items.map((notification) => <NotificationItem
              key={notification.id}
              notification={notification}
              disabled={isMarkingAllRead}
              onOpen={() => void openNotification(notification)}
              onMarkAsRead={() => void markAsRead(notification)}
            />)}
          </ul>
        </section>)}
      </div>}
  </PageContainer>;
}
