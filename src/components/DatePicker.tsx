"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_TODAY_STR } from "@/lib/data";

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
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // 9 = October (0-indexed)

  const handlePrevMonth = () => {
    if (currentMonthIndex === 9 && currentYear === 2026) return;
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 10 && currentYear === 2026) return;
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

  const isPastDay = (day: number) => {
    const formatted = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return formatted < DEMO_TODAY_STR;
  };

  const isToday = (day: number) => {
    const formatted = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return formatted === DEMO_TODAY_STR;
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
            disabled={currentMonthIndex === 9 && currentYear === 2026}
            className="p-2 rounded-full hover:bg-[#3A3A3C] text-[#B8B8BC] hover:text-[#F5F2EC] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={currentMonthIndex === 10 && currentYear === 2026}
            className="p-2 rounded-full hover:bg-[#3A3A3C] text-[#B8B8BC] hover:text-[#F5F2EC] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {WEEKDAYS.map((day) => (
          <span key={day} className="text-[11px] font-semibold text-[#B8B8BC] uppercase tracking-wider py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 w-full" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const formattedString = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          
          const past = isPastDay(dayNum);
          const today = isToday(dayNum);
          const isSelected = selectedDate === formattedString;

          return (
            <button
              key={dayNum}
              type="button"
              disabled={past}
              onClick={() => onSelectDate(formattedString)}
              className={cn(
                "h-10 w-full rounded-xl text-sm font-medium flex flex-col items-center justify-center relative transition-all duration-150",
                past
                  ? "text-[#B8B8BC]/30 cursor-not-allowed"
                  : isSelected
                  ? "bg-[#F4694C] text-[#F5F2EC] font-semibold shadow-md shadow-[#F4694C]/30 scale-[1.05]"
                  : today
                  ? "bg-[#3A3A3C] text-[#F59E0B] border border-[#F59E0B]/50 hover:bg-[#3E3E42]"
                  : "text-[#F5F2EC] hover:bg-[#3A3A3C] hover:border-[#F4694C]/40 border border-transparent"
              )}
            >
              <span>{dayNum}</span>
              {today && (
                <span className="w-1 h-1 rounded-full bg-[#F59E0B] absolute bottom-1.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
