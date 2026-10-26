import { apiRequest } from "@/lib/api/client";
import type { NotificationResponse, NotificationsResponse, UnreadNotificationCountResponse } from "@/types/notifications";

export const listNotifications = (): Promise<NotificationsResponse> =>
  apiRequest<NotificationsResponse>("/notifications");

export const getUnreadNotificationCount = (): Promise<UnreadNotificationCountResponse> =>
  apiRequest<UnreadNotificationCountResponse>("/notifications/unread-count");

export const markNotificationAsRead = (id: string): Promise<NotificationResponse> =>
  apiRequest<NotificationResponse>(`/notifications/${id}/read`, { method: "PATCH" });
