"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useModal } from "@/stores/modal/use-modal-store";
import { playSoundEffect, primeAudioPlayback } from "@/utils";
import {
  useCurrentNotificationStore,
  useNotificationSettingsStore,
  useAuthStore,
  useTenantStore,
} from "@/stores";
import { NotificationParams, NotificationType } from "@/types/notification";
import { notificationsService } from "@/services/notifications-service";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationAlertState } from "./notification-alert-state";

export function useNotifications(
  initialFilters: Omit<NotificationParams, "skip" | "take"> = {},
) {
  const queryClient = useQueryClient();
  const filtersKey = JSON.stringify(initialFilters);
  const filters = useMemo(() => initialFilters, [filtersKey]);
  const queryKey = useMemo(() => ["notifications", filters] as const, [filters]);
  const { openModal } = useModal();
  const { setCurrentNotification } = useCurrentNotificationStore();
  const { soundEnabled, soundType, browserNotificationsEnabled } =
    useNotificationSettingsStore();

  const soundEnabledRef = useRef(soundEnabled);
  const soundTypeRef = useRef(soundType);
  const browserNotificationsEnabledRef = useRef(browserNotificationsEnabled);
  const hasEstablishedBaselineRef = useRef(false);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    soundTypeRef.current = soundType;
  }, [soundType]);

  useEffect(() => {
    browserNotificationsEnabledRef.current = browserNotificationsEnabled;
  }, [browserNotificationsEnabled]);

  useEffect(() => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted" &&
      !browserNotificationsEnabled
    ) {
      useNotificationSettingsStore.setState({
        browserNotificationsEnabled: true,
      });
    }
  }, [browserNotificationsEnabled]);

  useEffect(() => {
    void primeAudioPlayback(soundType);
  }, [soundType]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const unlockAudio = async () => {
      await primeAudioPlayback(soundTypeRef.current);
    };

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const playNotificationSound = useCallback(async () => {
    if (!soundEnabledRef.current) return;

    const didPlay = await playSoundEffect(soundTypeRef.current, 0.5);
    if (!didPlay) {
      console.warn("Navegador não permitiu reproduzir o som da notificação.");
    }
  }, []);

  const showBrowserNotification = useCallback((notification: NotificationType) => {
    if (
      !browserNotificationsEnabledRef.current ||
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
      tag: notification.id,
    });

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
    };
  }, []);

  const alertForNewNotification = useCallback(
    (notification: NotificationType) => {
      if (!notificationAlertState.shouldAlert(notification.id)) return;

      void playNotificationSound();
      showBrowserNotification(notification);
    },
    [playNotificationSound, showBrowserNotification],
  );

  const { user } = useAuthStore();
  const { activeOrganization } = useTenantStore();
  const isPlatformAdmin = Boolean(user?.isPlatformAdmin || user?.role === 'ADMIN');
  const hasTenant = Boolean(activeOrganization?.id);
  const isNotificationsEnabled = !isPlatformAdmin && hasTenant;

  const TAKE = 5;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) =>
      notificationsService.getNotifications({
        ...filters,
        skip: pageParam as number,
        take: TAKE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const items = Array.isArray(lastPage?.data) ? lastPage.data : [];
      if (items.length < TAKE) return undefined;
      return allPages.length * TAKE;
    },
    enabled: isNotificationsEnabled,
    retry: false,
    staleTime: 1000 * 60,
    // Polling (a API não expõe WebSocket); pausa quando o separador está em segundo plano ou desativado
    refetchInterval: isNotificationsEnabled ? 1000 * 20 : false,
    refetchIntervalInBackground: false,
  });

  const notifications = useMemo(() => {
    if (!data?.pages || !Array.isArray(data.pages)) return [];
    return data.pages.flatMap((page) => (Array.isArray(page?.data) ? page.data : []));
  }, [data?.pages]);

  useEffect(() => {
    if (!data?.pages || hasEstablishedBaselineRef.current) return;

    const existingIds = data.pages.flatMap((page) =>
      Array.isArray(page?.data) ? page.data.map((notification) => notification.id) : [],
    );

    notificationAlertState.establishBaseline(existingIds);
    hasEstablishedBaselineRef.current = true;
  }, [data]);

  useEffect(() => {
    if (!notificationAlertState.isBaselineEstablished()) return;

    notifications.forEach((notification) => {
      alertForNewNotification(notification);
    });
  }, [notifications, alertForNewNotification]);

  // Mutations
  const { mutateAsync: markAsRead } = useMutation({
    mutationFn: notificationsService.markAsRead,
    onMutate: async (id) => {
      queryClient.setQueryData<any>(
        queryKey,
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData.pages)) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: Array.isArray(page?.data)
                ? page.data.map((n: NotificationType) =>
                    n.id === id ? { ...n, isRead: true } : n,
                  )
                : [],
            })),
          };
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const { mutateAsync: markAllAsRead, isPending: isMarkingAllAsRead } = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onMutate: async () => {
      queryClient.setQueryData<any>(
        queryKey,
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData.pages)) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: Array.isArray(page?.data)
                ? page.data.map((n: NotificationType) => ({
                    ...n,
                    isRead: true,
                  }))
                : [],
            })),
          };
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const { mutateAsync: deleteNotification } = useMutation({
    mutationFn: notificationsService.deleteNotification,
    onMutate: async (id) => {
      queryClient.setQueryData<any>(
        queryKey,
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData.pages)) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: Array.isArray(page?.data)
                ? page.data.filter((n: NotificationType) => n.id !== id)
                : [],
            })),
          };
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = (notification: NotificationType) => {
    openModal("notify-detail");
    setCurrentNotification(notification);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const unreadCount = useMemo(() => {
    const firstPageUnread = data?.pages?.[0]?.unreadCount;
    if (typeof firstPageUnread === "number") {
      return firstPageUnread;
    }
    return notifications.filter((n) => !n.isRead).length;
  }, [data?.pages, notifications]);

  return {
    notifications,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
    deleteNotification,
    handleNotificationClick,
    refetch,
    unreadCount,
  };
}
