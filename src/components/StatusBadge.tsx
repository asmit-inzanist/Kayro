"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type StatusBadgeType =
  | "Booked"
  | "Done"
  | "Missed"
  | "No-show"
  | "Confirmed"
  | "Unconfirmed"
  | "Awaiting"
  | "Awaiting confirmation"
  | "Cancelled"
  | "Rescheduled";

interface StatusBadgeProps {
  status: StatusBadgeType | string | boolean;
  className?: string;
  size?: "xs" | "sm" | "md";
  heroVariant?: boolean;
}

export function StatusBadge({
  status,
  className,
  size = "sm",
  heroVariant = false,
}: StatusBadgeProps) {
  // Support boolean (confirmed = true / false)
  if (typeof status === "boolean") {
    if (status) {
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] text-[11px] font-medium",
            className
          )}
        >
          Confirmed
        </span>
      );
    }
    if (heroVariant) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#000000]/25 border border-[#F59E0B]/35 text-[#F59E0B] text-xs font-medium backdrop-blur-sm",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
          Awaiting confirmation
        </span>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] text-[11px] font-medium",
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
        Awaiting confirmation
      </span>
    );
  }

  const norm = (status || "").toString().toLowerCase();

  if (norm.includes("awaiting") || norm === "unconfirmed" || norm === "pending") {
    if (heroVariant) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#000000]/25 border border-[#F59E0B]/35 text-[#F59E0B] text-xs font-medium backdrop-blur-sm",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
          Awaiting confirmation
        </span>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] text-[11px] font-medium",
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
        Awaiting confirmation
      </span>
    );
  }

  if (norm === "confirmed") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] text-[11px] font-medium",
          className
        )}
      >
        Confirmed
      </span>
    );
  }

  if (norm === "done") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] text-[10px] font-semibold",
          className
        )}
      >
        Done
      </span>
    );
  }

  if (norm === "missed" || norm === "no-show" || norm === "noshow") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full bg-[#F87171]/15 border border-[#F87171]/30 text-[#F87171] text-[10px] font-semibold",
          className
        )}
      >
        {norm.includes("missed") ? "Missed" : "No-show"}
      </span>
    );
  }

  if (norm === "cancelled") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full bg-[#F87171]/15 border border-[#F87171]/30 text-[#F87171] text-[10px] font-semibold",
          className
        )}
      >
        Cancelled
      </span>
    );
  }

  if (norm === "rescheduled") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-[10px] font-semibold",
          className
        )}
      >
        Rescheduled
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#2A2A2C] border border-[#3A3A3C] text-[#B8B8BC] text-[11px] font-medium",
        className
      )}
    >
      {status}
    </span>
  );
}
