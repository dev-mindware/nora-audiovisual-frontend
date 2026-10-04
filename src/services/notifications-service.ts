import { api } from "@/services/api";
import { NotificationParams, NotificationType } from "@/types";

export interface GetNotificationsResponse {
  data: NotificationType[];
  total: number;
  unreadCount?: number;
}

export const notificationsService = {
  getNotifications: async (params: NotificationParams): Promise<GetNotificationsResponse> => {
    const response = await api.get<any>("/notifications", {
      params,
    });

    const payload = response.data;
    const rawList: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    const normalizedList: NotificationType[] = rawList.map((item) => ({
      id: item.id || `notif-${Math.random().toString(36).slice(2, 9)}`,
      title: item.title || "",
      message: item.message || "",
      type: item.type || "INFO",
      userId: item.userId || "",
      companyId: item.organizationId || item.companyId,
      isRead: item.status === "READ" || Boolean(item.readAt) || item.isRead === true,
      createdAt: item.createdAt || new Date().toISOString(),
      metadata: item.metadata,
    }));

    return {
      data: normalizedList,
      total: typeof payload?.total === "number" ? payload.total : normalizedList.length,
      unreadCount: typeof payload?.unreadCount === "number" ? payload.unreadCount : undefined,
    };
  },

  markAsRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await api.patch("/notifications/read-all");
  },

  deleteNotification: async (id: string) => {
    await api.delete(`/notifications/${id}`);
  },
};

