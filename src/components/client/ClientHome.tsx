"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { SunMascot } from "@/components/SunMascot";
import { StatusBadge } from "@/components/StatusBadge";
import { Calendar, Check, AlertTriangle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDateLabel, formatTimeLabel, isWithin24h, isPastAppointment } from "@/lib/utils";
import { getNow, getTodayStr, getTomorrowStr } from "@/lib/data";

export function ClientHome() {
  const {
    appointments,
    upcomingClientAppointments,
    pastClientAppointments,
    confirmAppointment,
    setClientScreen,
    setActiveRescheduleId,
    cancelAppointment,
    loading,
    error,
    refetch,
    deviceIdentity,
  } = useRole();

  const clientFirstName = deviceIdentity.name.trim().split(" ")[0] || "there";

  // Next session is earliest upcoming appointment
  const nextSession = upcomingClientAppointments[0];

  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();
  let heroTimingLabel = "upcoming";
  if (nextSession) {
    if (nextSession.date === tomorrowStr) {
      heroTimingLabel = "tomorrow";
    } else if (nextSession.date === todayStr) {
      heroTimingLabel = "today";
    } else {
      heroTimingLabel = formatDateLabel(nextSession.date, "EEEE, d MMM");
    }
  }

  // 24-hour popup state: shown once per client session
  const [popupOpen, setPopupOpen] = useState(false);
  const [hasPrompted24h, setHasPrompted24h] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setHasPrompted24h(false);
  }, [deviceIdentity.phone]);

  useEffect(() => {
    if (!hasPrompted24h && nextSession && !nextSession.confirmed && isWithin24h(nextSession)) {
      setPopupOpen(true);
      setHasPrompted24h(true);
    }
  }, [nextSession, hasPrompted24h]);

  const handleConfirmNextSession = async () => {
    if (nextSession && !isConfirming) {
      setIsConfirming(true);
      try {
        await confirmAppointment(nextSession.id);
      } finally {
        setIsConfirming(false);
        setPopupOpen(false);
      }
    }
  };

  const handleReschedule = (aptId: string) => {
    setActiveRescheduleId(aptId);
    setClientScreen("reschedule");
  };

  // Recent 2 past sessions from the store
  const recentTwoPast = pastClientAppointments.slice(0, 2);

  if (loading) {
    return (
      <div className="space-y-7 animate-in fade-in-50 duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-[#2A2A2C] rounded-xl animate-pulse" />
            <div className="h-4 w-80 bg-[#2A2A2C] rounded-lg animate-pulse" />
          </div>
          <div className="h-9 w-40 bg-[#2A2A2C] rounded-full animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:items-stretch">
          <div className="lg:col-span-8 bg-[#365744]/70 rounded-[26px] p-7 sm:p-8 min-h-[360px] animate-pulse" />
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-5 h-44 animate-pulse" />
            <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-5 h-44 animate-pulse" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="h-7 w-52 bg-[#2A2A2C] rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-5 h-44 animate-pulse" />
            <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-5 h-44 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error && upcomingClientAppointments.length === 0 && pastClientAppointments.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[24px] p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-normal text-[#F5F2EC]">
            Unable to load schedule
          </h3>
          <p className="text-xs text-[#B8B8BC] leading-relaxed">
            {error || "We could not establish a connection to your consultation records."}
          </p>
          <Button
            onClick={() => refetch()}
            variant="coral"
            className="rounded-full text-xs shadow-md shadow-[#F4694C]/25"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-in fade-in-50 duration-200">
      {/* 24-HOUR CONFIRMATION POPUP */}
      {nextSession && (
        <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
          <DialogContent className="max-w-md bg-[#2A2A2C] border-[#3A3A3C] rounded-[24px]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B]">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <DialogTitle className="font-serif text-2xl font-normal text-[#F5F2EC]">
                  Upcoming <em className="italic text-[#F4694C]">Session</em>
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-[#B8B8BC] pt-1">
                Your consultation with Dr. Kayro is within 24 hours. Please confirm your attendance to hold your spot.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#3A3A3C] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#B8B8BC]">Date &amp; Time</span>
                <span className="font-semibold text-[#F4694C]">
                  {formatDateLabel(nextSession.date)} at {formatTimeLabel(nextSession.time)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#B8B8BC]">Consultant</span>
                <span className="font-semibold text-[#F5F2EC]">Dr. Kayro</span>
              </div>
            </div>

            <DialogFooter className="mt-3 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPopupOpen(false)}
                className="rounded-full text-xs flex-1"
              >
                Remind Me Later
              </Button>
              <Button
                onClick={handleConfirmNextSession}
                disabled={isConfirming}
                variant="coral"
                className="rounded-full text-xs flex-1 shadow-lg shadow-[#F4694C]/25"
              >
                {isConfirming ? "Confirming..." : "Yes, I'll be there"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-[34px] font-normal text-white tracking-tight leading-tight">
            Welcome back, <em className="font-serif italic font-normal text-white">{clientFirstName}</em>
          </h1>
          <p className="text-xs text-[#B8B8BC] mt-1.5 font-sans">
            Here is your clinical nutrition status &amp; upcoming session overview.
          </p>
        </div>

        {/* Top-Right Doctor Pill */}
        <div className="flex items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A2A2C] border border-[#3A3A3C] text-xs font-medium text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            <span>Dr. Kayro</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Hero Green Card (Left) + Stacked Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:items-stretch">
        {/* Left Column: Hero Green Card (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-[#365744] rounded-[26px] p-7 sm:p-8 relative overflow-hidden text-white shadow-xl flex-1 flex flex-col justify-between">
            {nextSession ? (
              <>
                {/* Top Content */}
                <div>
                  {/* Badge */}
                  <div className="mb-4">
                    <StatusBadge
                      status={nextSession.confirmed}
                      heroVariant={true}
                    />
                  </div>

                  {/* Title */}
                  <h2 className="font-serif text-3xl sm:text-[36px] font-normal leading-tight text-white">
                    Your next session,{" "}
                    <em className="font-serif italic font-normal text-white">
                      {heroTimingLabel}
                    </em>
                  </h2>

                  {/* Date & Time */}
                  <div className="text-lg sm:text-xl font-bold font-sans text-white mt-1.5">
                    {formatDateLabel(nextSession.date)}, {formatTimeLabel(nextSession.time)}
                  </div>

                  {/* Doctor Line */}
                  <p className="text-xs text-white/80 mt-1 font-sans">
                    With Dr. Kayro • 45-min Clinical Nutrition
                  </p>

                  {/* Tag Chips */}
                  <div className="flex flex-wrap gap-2 mt-5">
                    {["Diet Plan Review", "Gut Health Protocol"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="px-3.5 py-1 rounded-full text-xs font-medium bg-[#1C1C1E]/30 text-white/90 border border-white/10 backdrop-blur-xs"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Bottom Row: Actions + Sun Mascot */}
                <div className="mt-14 sm:mt-16 flex items-end justify-between relative">
                  {/* Two CTA Buttons */}
                  <div className="flex items-center gap-3 z-10">
                    <button
                      type="button"
                      onClick={handleConfirmNextSession}
                      disabled={isConfirming}
                      className="bg-[#F4694C] hover:bg-[#E05538] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                    >
                      {nextSession.confirmed ? "Confirmed ✓" : isConfirming ? "Confirming..." : "Yes, I'll be there"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReschedule(nextSession.id)}
                      className="bg-[#F5F2EC] hover:bg-white text-[#1C1C1E] text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-colors cursor-pointer"
                    >
                      Reschedule
                    </button>
                  </div>

                  {/* Sun Mascot */}
                  <div className="absolute -bottom-2 right-0 sm:right-4 pointer-events-none transform translate-y-1">
                    <SunMascot size={115} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center py-12 text-center space-y-4">
                <SunMascot size={110} />
                <h3 className="font-serif text-2xl font-normal text-white">
                  Nothing booked yet
                </h3>
                <p className="text-xs text-white/80 max-w-sm">
                  Ready to book your next dietary review with Dr. Kayro?
                </p>
                <Button
                  variant="coral"
                  onClick={() => setClientScreen("book")}
                  className="rounded-full"
                >
                  Book a Consultation
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 3 Stacked Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Recent sessions (Store-derived) */}
          <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-normal text-white">
                Recent{" "}
                <em className="font-serif italic font-normal text-white">sessions</em>
              </h3>
              <button
                type="button"
                onClick={() => setClientScreen("appointments")}
                className="text-[11px] text-[#B8B8BC] hover:text-white transition-colors cursor-pointer"
              >
                See all
              </button>
            </div>

            <div className="mt-3.5 space-y-2">
              {recentTwoPast.length === 0 ? (
                <p className="text-xs text-[#B8B8BC] py-2">No past sessions recorded.</p>
              ) : (
                recentTwoPast.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-[#141416] border border-[#3A3A3C] rounded-xl px-3 py-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={
                          apt.clientAction === "Cancelled"
                            ? "Cancelled"
                            : apt.clientAction === "Rescheduled"
                            ? "Rescheduled"
                            : apt.status === "Booked" && isPastAppointment(apt)
                            ? "Awaiting update"
                            : apt.status
                        }
                        size="xs"
                      />
                      <span className="text-xs text-[#F5F2EC] font-medium">
                        {formatDateLabel(apt.date)}, {formatTimeLabel(apt.time)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setClientScreen("book")}
                      className="text-xs text-[#F4694C] font-semibold hover:underline cursor-pointer"
                    >
                      Book again
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 2: Before your session */}
          <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-5">
            <h3 className="font-serif text-sm font-normal text-white">
              Before your{" "}
              <em className="font-serif italic font-normal text-white">session</em>
            </h3>
            <div className="mt-3.5 space-y-2.5">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />
                <span className="text-xs text-[#F5F2EC] leading-relaxed">
                  Confirm the day before. Tap confirm so we hold your slot.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />
                <span className="text-xs text-[#F5F2EC] leading-relaxed">
                  Join 5 minutes early
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />
                <span className="text-xs text-[#F5F2EC] leading-relaxed">
                  Keep your latest food log handy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Upcoming Appointments (Store-derived) */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-white">
            Upcoming appointments
          </h2>
          <button
            type="button"
            onClick={() => setClientScreen("appointments")}
            className="text-xs font-semibold text-[#F4694C] hover:underline cursor-pointer"
          >
            See all ({upcomingClientAppointments.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingClientAppointments.length === 0 ? (
            <div className="col-span-2 p-6 rounded-[22px] bg-[#2A2A2C] border border-[#3A3A3C] text-center text-xs text-[#B8B8BC]">
              No upcoming appointments. Use &ldquo;Book Consultation&rdquo; to reserve your next slot.
            </div>
          ) : (
            upcomingClientAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-3">
                    <StatusBadge status={apt.confirmed} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    Nutrition consultation
                  </h4>
                  {apt.rescheduledFrom && (
                    <p className="text-[11px] text-[#B8B8BC] mt-0.5">
                      {(() => {
                        const orig = appointments.find((a) => a.id === apt.rescheduledFrom);
                        return orig
                          ? `Rescheduled from ${formatDateLabel(orig.date, "EEE d MMM")} · ${formatTimeLabel(orig.time)}`
                          : null;
                      })()}
                    </p>
                  )}
                  <p className="text-xs text-[#B8B8BC] mt-0.5 mb-3.5">
                    Dr. Kayro • 45 min
                  </p>

                  {/* Date Box */}
                  <div className="bg-[#141416] border border-[#3A3A3C] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-[#F5F2EC] mb-4">
                    <Calendar className="w-3.5 h-3.5 text-[#F4694C] shrink-0" />
                    <span>
                      {formatDateLabel(apt.date)}, {formatTimeLabel(apt.time)}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleReschedule(apt.id)}
                    className="bg-[#2A2A2C] hover:bg-[#323338] text-[#F5F2EC] text-xs font-medium py-2 px-8 rounded-full border border-white/5 transition-colors flex-1 text-center cursor-pointer"
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelAppointment(apt.id)}
                    className="text-xs text-[#B8B8BC] hover:text-[#D64545] transition-colors cursor-pointer px-3"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
