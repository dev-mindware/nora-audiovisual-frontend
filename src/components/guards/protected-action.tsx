"use client";

import React from "react";
import { useModal } from "@/stores";
import { useAuth } from "@/hooks/auth";
import { SubscriptionStatus } from "@/types";

interface ProtectedActionProps {
  children: React.ReactNode;
  onAction?: React.MouseEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export function ProtectedAction({
  children,
  onAction,
  onClick,
}: ProtectedActionProps) {
  const { openModal } = useModal();
  const { subscriptionStatus, hasActiveSubscription } = useAuth();

  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    if (subscriptionStatus === SubscriptionStatus.PENDING) {
      e.preventDefault();
      e.stopPropagation();
      openModal("pending-subscription-modal");
      return;
    }

    if (!hasActiveSubscription) {
      e.preventDefault();
      e.stopPropagation();
      openModal("subscription-expired-modal");
      return;
    }

    if (onAction) {
      onAction(e);
    } else if (onClick) {
      onClick(e);
    } else if (React.isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>;
      if (typeof childProps.onClick === "function") {
        childProps.onClick(e);
      }
    }
  };

  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return <>{children}</>;
}
