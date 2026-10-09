"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationList } from "./notification-list";
import { useNotifications } from "@/hooks/notifications/use-notifications";
import { useNotificationSettingsStore } from "@/stores";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const badgeEnabled = useNotificationSettingsStore(
    (state) => state.badgeEnabled,
  );
  const {
    notifications,
    handleNotificationClick,
    deleteNotification,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative  hover:bg-primary-50"
          aria-label="Abrir notificações"
        >
          <Bell className="h-5 w-5 text-foreground" />
          {badgeEnabled && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-primary text-primary-foreground text-[10px] rounded-none flex items-center justify-center font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 p-0 shadow-lg border-border rounded-none"
        sideOffset={8}
      >
        <NotificationList
          isDropdown
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          notifications={notifications}
          isFetchingNextPage={isFetchingNextPage}
          deleteNotification={deleteNotification}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={markAllAsRead}
          isMarkingAllAsRead={isMarkingAllAsRead}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
