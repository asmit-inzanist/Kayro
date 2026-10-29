"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDateLabel, formatTimeLabel, getBookableDays } from "@/lib/utils";
import { getSlotsForDate } from "@/lib/data";

export function ClientReschedule() {
  const {
    appointments,
    activeRescheduleId,
    rescheduleAppointment,
    setClientScreen,
  } = useRole();

  const appointmentToReschedule =
    appointments.find((apt) => apt.id === activeRescheduleId) ||
    appointments.find((apt) => apt.status === "Booked" && apt.clientAction === "none") ||
    appointments[0];

  const bookableDays = getBookableDays(14);

  // Pagination: show 7 days at a time
  const PAGE_SIZE = 7;
  const [datePageOffset, setDatePageOffset] = useState(0);
  const pagedDays = bookableDays.slice(datePageOffset, datePageOffset + PAGE_SIZE);
  const canGoPrev = datePageOffset > 0;
  const canGoNext = datePageOffset + PAGE_SIZE < bookableDays.length;

  // Default to tomorrow or next available day
  const defaultDate = (bookableDays.find((d) => !d.isSunday))?.dateStr || "";
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedTime, setSelectedTime] = useState<string>("14:00");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Slots for the selected date, excluding the currently held slot so it is not offered
  React.useEffect(() => {
    let isMounted = true;
    setSlotsLoading(true);
    getSlotsForDate(selectedDate, appointmentToReschedule?.id).then((data) => {
      if (isMounted) {
        setSlots(data);
        setSlotsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedDate, appointmentToReschedule?.id]);

  const handleConfirmNewTime = async () => {
    if (!appointmentToReschedule) return;
    setErrorMessage(null);
    setIsRescheduling(true);

    const result = await rescheduleAppointment(
      appointmentToReschedule.id,
      selectedDate,
      selectedTime
    );

    setIsRescheduling(false);

    if (!result.ok) {
      if (result.reason === "slot_taken") {
        setErrorMessage("That slot was just taken, please pick another.");
        getSlotsForDate(selectedDate, appointmentToReschedule.id).then((data) => {
          setSlots(data);
        });
      } else if (result.reason === "same_slot") {
        setErrorMessage("You currently hold this slot. Please pick a new date or time.");
      } else {
        setErrorMessage("Could not reschedule session. Please pick another slot.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => setClientScreen("appointments")}
          className="inline-flex items-center gap-1.5 text-xs text-[#B8B8BC] hover:text-[#F5F2EC] mb-2 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Appointments
        </button>
        <h1 className="font-serif text-3xl lg:text-4xl font-normal text-[#F5F2EC]">
          Reschedule <em className="italic">Consultation</em>
        </h1>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Amber Warning Banner */}
      <div className="bg-[#F59E0B]/15 border-l-4 border-[#F59E0B] p-4 sm:p-5 rounded-r-2xl flex items-start gap-3.5 shadow-md">
        <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-[#F5F2EC]">
            Current Slot Held Until New Confirmation
          </h4>
          <p className="text-xs text-[#F5F2EC]/85 leading-relaxed">
            Rescheduling session currently booked for{" "}
            <span className="font-semibold text-white">
              {appointmentToReschedule
                ? `${formatDateLabel(appointmentToReschedule.date)}, ${formatTimeLabel(appointmentToReschedule.time)}`
                : "Thursday, 29 Oct, 10:00 AM"}
            </span>{" "}
            with <span className="font-semibold text-white">Dr. Kayro</span>. Your existing slot remains safe in your schedule until you finalize the new time below.
          </p>
        </div>
      </div>

      {/* Teal Card (#3D5F5F) */}
      <div className="bg-[#3D5F5F] border border-[#4E7676] rounded-[24px] p-6 sm:p-8 text-[#F5F2EC] shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div>
            <span className="text-xs font-semibold text-[#F5F2EC]/80 uppercase tracking-wider block mb-1">
              Step 1 of 2
            </span>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-2xl font-normal text-white">
                Pick a new date
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDatePageOffset((o) => Math.max(0, o - PAGE_SIZE))}
                  disabled={!canGoPrev}
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  aria-label="Previous days"
                >
                  <ChevronLeft className="w-4 h-4 text-[#F5F2EC]" />
                </button>
                <button
                  type="button"
                  onClick={() => setDatePageOffset((o) => Math.min(bookableDays.length - PAGE_SIZE, o + PAGE_SIZE))}
                  disabled={!canGoNext}
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  aria-label="Next days"
                >
                  <ChevronRight className="w-4 h-4 text-[#F5F2EC]" />
                </button>
              </div>
            </div>
            <p className="text-xs text-[#F5F2EC]/80">
              Showing next 14 consultation days starting from today
            </p>
          </div>

          {/* 7-Day Date Strip (paged) */}
          <div className="flex items-center gap-2.5">
            {pagedDays.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              if (item.isSunday) {
                return (
                  <div
                    key={item.dateStr}
                    title="Closed on Sundays"
                    className="flex-1 bg-[#3D5F5F]/30 border border-white/10 py-3 px-2 rounded-2xl flex flex-col items-center justify-center opacity-40 cursor-not-allowed select-none"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-[#F5F2EC]/60 line-through">
                      {item.dayName}
                    </span>
                    <span className="text-lg font-bold text-white/50 mt-0.5 line-through">
                      {item.dayNum}
                    </span>
                    <span className="text-[8px] text-white/40 mt-0.5">Closed</span>
                  </div>
                );
              }
              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => {
                    setSelectedDate(item.dateStr);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className={cn(
                    "flex-1 py-3 px-2 rounded-2xl border text-center transition-all duration-150 flex flex-col items-center justify-center cursor-pointer",
                    isSelected
                      ? "bg-[#F4694C] text-white border-[#F4694C] shadow-lg shadow-black/20 font-bold scale-[1.04]"
                      : "bg-[#3D5F5F]/70 text-[#F5F2EC] border-white/20 hover:bg-[#3D5F5F] hover:border-white/40"
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-80">
                    {item.dayName}
                  </span>
                  <span className="text-lg font-bold mt-0.5">{item.dayNum}</span>
                </button>
              );
            })}
          </div>

          <div>
            <span className="text-xs font-semibold text-[#F5F2EC]/80 uppercase tracking-wider block mb-1">
              Step 2 of 2
            </span>
            <h3 className="font-serif text-2xl font-normal text-white mb-2">
              Select a new time
            </h3>
            <p className="text-xs text-[#F5F2EC]/80 mb-4">
              Timezone: IST (UTC+05:30) • 30-min schedule grid
            </p>

            <div className="bg-[#3D5F5F]/80 border border-white/20 rounded-[22px] p-5">
              {slotsLoading && slots.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-12 bg-white/10 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <TimeSlotPicker
                  slots={slots}
                  selectedTime={selectedTime}
                  onSelectTime={(t) => {
                    setSelectedTime(t);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  columns={4}
                />
              )}
            </div>
          </div>

          {/* Review selection & Confirm CTA */}
          <div className="pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left w-full sm:w-auto">
              <span className="text-xs text-[#F5F2EC]/80 block">
                Selected Reschedule Time:
              </span>
              <p className="font-serif text-xl font-bold text-white">
                {formatDateLabel(selectedDate, "EEEE, d MMM yyyy")} at {formatTimeLabel(selectedTime)}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setClientScreen("appointments")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmNewTime}
                disabled={isRescheduling}
                className="bg-[#F4694C] hover:bg-[#E05538] text-white font-semibold px-8 py-3 rounded-full shadow-lg shadow-black/30 flex-1 sm:flex-none cursor-pointer"
              >
                {isRescheduling ? "Updating schedule..." : "Confirm New Time"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
