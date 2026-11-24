import { apiRequest } from "@/lib/api/client";
import type { NotificationResponse, NotificationsResponse, UnreadNotificationCountResponse } from "@/types/notifications";

export const listNotifications = (page = 1, status: "all" | "unread" | "read" = "all"): Promise<NotificationsResponse> =>
  apiRequest<NotificationsResponse>(`/notifications?page=${page}&limit=30&status=${status}`);

export const getUnreadNotificationCount = (): Promise<UnreadNotificationCountResponse> =>
  apiRequest<UnreadNotificationCountResponse>("/notifications/unread-count");

export const markNotificationAsRead = (id: string): Promise<NotificationResponse> =>
  apiRequest<NotificationResponse>(`/notifications/${id}/read`, { method: "PATCH" });

export const markAllNotificationsAsRead = () => apiRequest<{ data: { count: number } }>("/notifications/read-all", { method: "PATCH" });
