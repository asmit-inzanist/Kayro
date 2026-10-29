"use client";

import React from "react";
import { cn, formatTimeLabel } from "@/lib/utils";

export interface TimeSlotItem {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlotItem[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
  columns?: 2 | 3 | 4;
}

export function TimeSlotPicker({
  slots,
  selectedTime,
  onSelectTime,
  columns = 4,
}: TimeSlotPickerProps) {
  const colClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
      ? "grid-cols-3"
      : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className={`grid ${colClass} gap-2.5`}>
      {slots.map((slot) => {
        const isSelected = selectedTime === slot.time;
        const isBooked = !slot.available;
        const displayTime = formatTimeLabel(slot.time);

        return (
          <button
            key={slot.time}
            type="button"
            disabled={isBooked}
            onClick={() => onSelectTime(slot.time)}
            className={cn(
              "relative px-4 py-3 rounded-full text-sm font-medium transition-all duration-150 border text-center flex items-center justify-center gap-1.5",
              isBooked
                ? "bg-[#2A2A2C] text-[#B8B8BC]/40 border-[#3A3A3C] line-through cursor-not-allowed opacity-60"
                : isSelected
                ? "bg-[#F4694C] text-[#F5F2EC] border-[#F4694C] shadow-md shadow-[#F4694C]/25 font-semibold scale-[1.02]"
                : "bg-[#2A2A2C] text-[#F5F2EC] border-[#3A3A3C] hover:border-[#F4694C]/60 hover:bg-[#3A3A3C]"
            )}
          >
            <span>{displayTime}</span>
            {isBooked && (
              <span className="text-[10px] font-normal no-underline ml-1 text-[#B8B8BC]/60">
                (Full)
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
