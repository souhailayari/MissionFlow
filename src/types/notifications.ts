export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  missionId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsResponse = { data: Notification[] };
export type NotificationResponse = { data: Notification };
export type UnreadNotificationCountResponse = { data: { count: number } };
