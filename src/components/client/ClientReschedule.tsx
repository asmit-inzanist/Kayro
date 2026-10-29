"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, AlertCircle } from "lucide-react";
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

  // Default to tomorrow or next available day
  const defaultDate = bookableDays[1]?.dateStr || bookableDays[0]?.dateStr || "2026-10-29";
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedTime, setSelectedTime] = useState<string>("14:00");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Slots for the selected date, excluding the currently held slot so it is not offered
  const slots = getSlotsForDate(selectedDate, appointmentToReschedule?.id);

  const handleConfirmNewTime = () => {
    if (!appointmentToReschedule) return;
    setErrorMessage(null);
    setIsRescheduling(true);

    const result = rescheduleAppointment(
      appointmentToReschedule.id,
      selectedDate,
      selectedTime
    );

    setIsRescheduling(false);

    if (!result.ok) {
      if (result.reason === "slot_taken") {
        setErrorMessage("That slot was just taken, please pick another.");
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
            with <span className="font-semibold text-white">Dr. Anika Mehta</span>. Your existing slot remains safe in your schedule until you finalize the new time below.
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
            <h3 className="font-serif text-2xl font-normal text-white">
              Pick a new date
            </h3>
            <p className="text-xs text-[#F5F2EC]/80 mt-1">
              Showing next 14 consultation days starting from today (Wednesday, 28 Oct 2026)
            </p>
          </div>

          {/* Scrollable 14-Day Date Strip */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {bookableDays.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => {
                    setSelectedDate(item.dateStr);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className={cn(
                    "min-w-[84px] py-3 px-2 rounded-2xl border text-center transition-all duration-150 flex flex-col items-center justify-center shrink-0 cursor-pointer",
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
              <TimeSlotPicker
                slots={slots}
                selectedTime={selectedTime}
                onSelectTime={(t) => {
                  setSelectedTime(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                columns={4}
              />
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
