"use client"
import { useEffect } from "react";
import { NotificationItem } from "./notification-item";
import { NotificationType } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInView } from "react-intersection-observer";
import { EmptyState } from "@/components/common";
import { cn } from "@/lib";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCheck } from "lucide-react";

interface NotificationListProps {
  notifications: NotificationType[];
  onNotificationClick: (notification: NotificationType) => void;
  deleteNotification: (id: string) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  className?: string;
  isDropdown?: boolean;
  onMarkAllAsRead?: () => void;
  isMarkingAllAsRead?: boolean;
}

export function NotificationList({
  notifications,
  onNotificationClick,
  deleteNotification,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  className,
  isDropdown = false,
  onMarkAllAsRead,
  isMarkingAllAsRead,
}: NotificationListProps) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const unreadNotifications = notifications.filter(
    (n) => !n.isRead
  );

  const pathname = usePathname();
  const isPos = pathname?.startsWith("/pos");

  return (
    <div className="w-full">
      {isDropdown && (
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">Notificações</h3>
            {unreadNotifications.length > 0 && (
              <span className="text-[11px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                {unreadNotifications.length} nova{unreadNotifications.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadNotifications.length > 0 && onMarkAllAsRead && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAllAsRead();
                }}
                disabled={isMarkingAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors disabled:opacity-50 cursor-pointer"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                Marcar lidas
              </button>
            )}
            <Link
              href={isPos ? "/pos/notifications" : "/notifications"}
              className="text-primary text-xs font-medium hover:underline"
            >
              Ver todas
            </Link>
          </div>
        </div>
      )}

      <ScrollArea
        className={cn(
          notifications.length === 0 ? "h-max" : className || "h-72",
        )}
      >
        {notifications.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="BellOff"
              title="Sem notificações"
              className="border-none"
              description="Não existem novas notificações neste momento."
            />
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onNotificationClick(notification)}
                onDelete={() => deleteNotification(notification.id)}
              />
            ))}

            {(hasNextPage || isFetchingNextPage) && (
              <div ref={ref} className="flex items-center justify-center p-4">
                {isFetchingNextPage ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <span className="text-xs text-muted-foreground">A carregar mais...</span>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
