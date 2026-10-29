"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNow, getTodayStr } from "@/lib/data";

interface DatePickerProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (dateStr: string) => void;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DatePicker({
  selectedDate,
  onSelectDate,
  className,
}: DatePickerProps) {
  const now = getNow();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(now.getMonth());

  const isCurrentMonthOrEarlier =
    currentYear < now.getFullYear() ||
    (currentYear === now.getFullYear() && currentMonthIndex <= now.getMonth());

  const handlePrevMonth = () => {
    if (isCurrentMonthOrEarlier) return;
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayRaw = new Date(currentYear, currentMonthIndex, 1).getDay();
  const startDayOffset = (firstDayRaw + 6) % 7;

  const monthName = MONTH_NAMES[currentMonthIndex];
  const todayStr = getTodayStr();

  const isPastDay = (day: number) => {
    const formatted = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return formatted < todayStr;
  };

  const isToday = (day: number) => {
    const formatted = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return formatted === todayStr;
  };

  return (
    <div
      className={cn(
        "bg-[#2A2A2C] border border-[#3A3A3C] rounded-[24px] p-5 shadow-lg",
        className
      )}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h4 className="font-serif text-lg font-medium text-[#F5F2EC]">
            {monthName} <span className="text-[#B8B8BC] font-sans text-sm">{currentYear}</span>
          </h4>
          <p className="text-xs text-[#B8B8BC]">Consultations available Mon – Sun</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isCurrentMonthOrEarlier}
            className="p-2 rounded-full hover:bg-[#3A3A3C] text-[#B8B8BC] hover:text-[#F5F2EC] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-[#3A3A3C] text-[#B8B8BC] hover:text-[#F5F2EC] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-[11px] font-semibold text-[#B8B8BC]">
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Leading empty slots */}
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {/* Month days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const formatted = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDate === formatted;
          const disabled = isPastDay(day);
          const today = isToday(day);

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(formatted)}
              className={cn(
                "h-9 w-9 rounded-full mx-auto flex items-center justify-center text-xs font-medium transition-all relative",
                disabled && "text-[#B8B8BC]/30 cursor-not-allowed",
                !disabled && !isSelected && "hover:bg-[#3A3A3C] text-[#F5F2EC]",
                today && !isSelected && "border border-[#F4694C] text-[#F4694C]",
                isSelected &&
                  "bg-[#F4694C] text-[#F5F2EC] shadow-md shadow-[#F4694C]/30 font-semibold"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
