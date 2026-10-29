"use client";

import React, { useState, useMemo } from "react";
import { useRole } from "@/context/RoleContext";
import { SunMascot } from "@/components/SunMascot";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  User,
} from "lucide-react";
import { cn, formatDateLabel, formatTimeLabel, formatEndTime, formatPhone, getBookableDays } from "@/lib/utils";
import { getSlotsForDate, normalizePhoneDigits } from "@/lib/data";

export function ClientBook() {
  const { bookAppointment, setClientScreen, setDeviceIdentity } = useRole();

  // Navigation state within booking flow: "date" (Step 1) vs "details" (Step 3)
  const [cardStep, setCardStep] = useState<"date" | "details">("date");

  // 14 scrollable bookable days starting from today
  const bookableDays = useMemo(() => getBookableDays(14), []);

  // Pagination: show PAGE_SIZE days at a time with prev/next arrows
  const PAGE_SIZE = 7;
  const [datePageOffset, setDatePageOffset] = useState(0);
  const pagedDays = bookableDays.slice(datePageOffset, datePageOffset + PAGE_SIZE);
  const canGoPrev = datePageOffset > 0;
  const canGoNext = datePageOffset + PAGE_SIZE < bookableDays.length;

  // Booking form states - always start EMPTY, never prefill
  const defaultDate = (bookableDays.find((d) => !d.isSunday))?.dateStr || "";
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [patientGoal, setPatientGoal] = useState<string>(
    "Hormonal balance and sustained energy"
  );

  const monthYearLabel = useMemo(() => {
    if (bookableDays.length === 0) return "";
    const first = bookableDays[0].dateStr;
    const last = bookableDays[bookableDays.length - 1].dateStr;
    const m1 = formatDateLabel(first, "MMMM");
    const m2 = formatDateLabel(last, "MMMM");
    const y = formatDateLabel(last, "yyyy");
    return m1 === m2 ? `${m1} ${y}` : `${m1} / ${m2} ${y}`;
  }, [bookableDays]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookedSuccess, setIsBookedSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Form validity check: name is non-empty and phone normalises to exactly 10 digits
  const isFormValid =
    fullName.trim().length > 0 && normalizePhoneDigits(phone).length === 10;

  // Load slots dynamically from Supabase
  React.useEffect(() => {
    let isMounted = true;
    setSlotsLoading(true);
    getSlotsForDate(selectedDate).then((slots) => {
      if (isMounted) {
        setAvailableSlots(slots);
        setSlotsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const handleContinueToDetails = () => {
    setCardStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToDate = () => {
    setCardStep("date");
  };

  const handleConfirmBooking = async () => {
    if (!isFormValid) {
      setErrorMessage("Please enter your name and a valid 10-digit mobile number.");
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    const cleanName = fullName.trim();
    const cleanPhone = normalizePhoneDigits(phone);

    const result = await bookAppointment({
      clientName: cleanName,
      phone: cleanPhone,
      date: selectedDate,
      time: selectedTimeSlot,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      if (result.reason === "slot_taken") {
        setErrorMessage("That slot was just taken, please pick another.");
        // Refresh available slots immediately
        getSlotsForDate(selectedDate).then((slots) => {
          setAvailableSlots(slots);
        });
      } else {
        setErrorMessage("Could not secure consultation. Please pick another slot.");
      }
      return;
    }

    // Save the name and phone used in that booking to localStorage as the device identity
    setDeviceIdentity({
      name: cleanName,
      phone: cleanPhone,
    });

    setIsBookedSuccess(true);
  };

  if (isBookedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center animate-in zoom-in-95 duration-300">
        <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[28px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-[#F4694C]/15 blur-2xl pointer-events-none" />

          <div className="flex justify-center mb-6">
            <SunMascot size={130} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34D399]/15 border border-[#34D399]/40 text-[#34D399] text-xs font-semibold mb-3">
            <CheckCircle2 className="w-4 h-4" /> Booking Confirmed
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F2EC] font-normal mb-3">
            You&apos;re booked with <em className="italic">Dr. Kayro</em>!
          </h2>

          <p className="text-sm text-[#B8B8BC] max-w-md mx-auto mb-8 font-sans">
            A confirmation WhatsApp reminder with your in-clinic appointment details will be dispatched to{" "}
            <span className="text-[#F5F2EC] font-semibold">+91 {formatPhone(phone)}</span> and on the app 24 hours before the appointment.
          </p>

          <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl p-5 mb-8 max-w-md mx-auto text-left space-y-3 font-sans">
            <div className="flex justify-between items-center text-sm border-b border-[#3A3A3C]/60 pb-2.5">
              <span className="text-[#B8B8BC]">Consultant</span>
              <span className="font-semibold text-[#F5F2EC]">Dr. Kayro (PhD)</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-[#3A3A3C]/60 pb-2.5">
              <span className="text-[#B8B8BC]">Patient Name</span>
              <span className="font-semibold text-[#F5F2EC]">{fullName}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-[#3A3A3C]/60 pb-2.5">
              <span className="text-[#B8B8BC]">Date &amp; Time</span>
              <span className="font-semibold text-[#F4694C]">
                {formatDateLabel(selectedDate, "EEEE, d MMM yyyy")} • {formatTimeLabel(selectedTimeSlot)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#B8B8BC]">Session format</span>
              <span className="font-semibold text-[#34D399]">In-Clinic Consult</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => setClientScreen("appointments")}
              variant="coral"
              className="w-full sm:w-auto px-8 py-3 rounded-full h-11"
            >
              View My Appointments <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              onClick={() => {
                setIsBookedSuccess(false);
                setCardStep("date");
              }}
              variant="secondary"
              className="w-full sm:w-auto rounded-full h-11"
            >
              Book Another Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* ── TOP STEPPER ON DESKTOP (lg+) ── */}
      <div className="hidden lg:flex items-center justify-center gap-4 max-w-2xl mx-auto py-3 px-8 rounded-full bg-[#1C1C1E] border border-[#2A2A2C] mb-8 font-sans">
        {/* Step 1: Pick a day (Checked) */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#1E3D2C] border border-[#34D399] text-[#34D399] flex items-center justify-center text-[10px] font-bold shrink-0">
            ✓
          </span>
          <span className="font-semibold text-[#F5F2EC] text-xs">Pick a day</span>
        </div>

        <div className="h-px w-10 bg-[#34D399]/70" />

        {/* Step 2: Choose a time (Checked) */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#1E3D2C] border border-[#34D399] text-[#34D399] flex items-center justify-center text-[10px] font-bold shrink-0">
            ✓
          </span>
          <span className="font-semibold text-[#F5F2EC] text-xs">Choose a time</span>
        </div>

        <div className="h-px w-10 bg-[#F4694C]" />

        {/* Step 3: Your details (Active Coral Pill/Circle) */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#F4694C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-[#F4694C]/40">
            3
          </span>
          <span className="text-xs font-semibold text-[#F4694C]">Your details</span>
        </div>

        <div className="h-px w-10 bg-[#3A3A3C]" />

        {/* Step 4: Confirmation */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#2A2A2C] text-[#6E6E73] border border-[#3A3A3C] flex items-center justify-center font-medium text-xs shrink-0">
            4
          </span>
          <span className="text-xs text-[#6E6E73]">Confirmation</span>
        </div>
      </div>

      {/* ── MOBILE TOP NAVIGATION HEADER (< lg) ── */}
      <div className="lg:hidden flex items-center justify-between pb-3 pt-1 px-1 font-sans">
        {/* Back button */}
        <button
          type="button"
          onClick={() => {
            if (cardStep === "details") {
              setCardStep("date");
            } else {
              setClientScreen("home");
            }
          }}
          className="w-10 h-10 rounded-full bg-[#2A2A2C] border border-[#3A3A3C] flex items-center justify-center text-[#F5F2EC] hover:bg-[#343438] active:scale-95 transition-all cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Stepper indicators */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              cardStep === "date"
                ? "w-7 bg-[#F4694C] shadow-sm shadow-[#F4694C]/40"
                : "w-2 bg-[#34D399]"
            )}
          />
          <span
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              cardStep === "date"
                ? "w-2 bg-[#34D399]"
                : "w-2 bg-[#34D399]"
            )}
          />
          <span
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              cardStep === "details"
                ? "w-7 bg-[#F4694C] shadow-sm shadow-[#F4694C]/40"
                : "w-2 bg-[#2A2A2C] border border-[#3A3A3C]"
            )}
          />
          <span className="w-2 h-1.5 rounded-full bg-[#2A2A2C] border border-[#3A3A3C]" />
        </div>

        {/* Step counter */}
        <span className="text-xs text-[#86B3A2] font-medium">
          Step{" "}
          <span className="text-[#F5F2EC] font-semibold">
            {cardStep === "date" ? "1" : "3"}
          </span>{" "}
          of 4
        </span>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── MAIN LAYOUT GRID: Left (Green Card + Slots) | Right (Summary) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN (lg:col-span-8): Green Card + Time Slots Card ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* ═══════════════════════════════════════════════════════════
              TEAL SLATE CARD (#3D5F5F, same as Reschedule):
              State A: "Pick a day" (STEP 1)
              State B: "Tell us about you" (STEP 3)
          ═══════════════════════════════════════════════════════════ */}
          {cardStep === "date" ? (
            /* ── STATE A: STEP 1 • CONSULTATION DATE (Pick a day) ── */
            <div className="bg-[#3D5F5F] border border-[#4E7676] rounded-[26px] p-6 sm:p-8 text-[#F5F2EC] shadow-2xl relative overflow-hidden animate-in fade-in-50 duration-200">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Top Tagline */}
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#F5F2EC]/80 block mb-2 font-sans">
                  STEP 1 • CONSULTATION DATE
                </span>

                {/* Title */}
                <h2 className="font-serif text-3xl sm:text-[34px] font-normal leading-tight text-[#F5F2EC] mb-2">
                  Pick a <em className="font-serif italic font-normal text-[#F5F2EC]">day</em>
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-[#F5F2EC]/85 font-sans leading-relaxed mb-6 max-w-xl">
                  Select an upcoming weekday for your in-clinic nutrition consult.
                </p>

                {/* Month & Location Row + Pagination Arrows */}
                <div className="flex items-center justify-between text-xs mb-3 font-sans">
                  <span className="font-bold text-[#F5F2EC] text-sm sm:text-base tracking-tight">
                    {monthYearLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F5F2EC]/80 font-medium text-xs mr-2">
                      Asia/Kolkata
                    </span>
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

                {/* 7-Day Date Strip (paged) */}
                <div className="flex items-center gap-2.5 mb-5 font-sans">
                  {pagedDays.map((item) => {
                    const isSelected = selectedDate === item.dateStr;

                    if (item.isSunday) {
                      return (
                        <div
                          key={item.dateStr}
                          title="Closed on Sundays"
                          className="flex-1 bg-[#3D5F5F]/30 border border-white/10 py-3.5 px-2 rounded-2xl flex flex-col items-center justify-center opacity-40 cursor-not-allowed select-none"
                        >
                          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#F5F2EC]/60 line-through">
                            {item.dayName}
                          </span>
                          <span className="text-lg sm:text-2xl font-bold text-white/50 mt-0.5 line-through">
                            {item.dayNum}
                          </span>
                          <span className="text-[8px] text-white/40 mt-0.5 font-sans">Closed</span>
                        </div>
                      );
                    }

                    if (isSelected) {
                      return (
                        <button
                          key={item.dateStr}
                          type="button"
                          onClick={() => {
                            setSelectedDate(item.dateStr);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className="flex-1 bg-[#F4694C] text-white border border-[#F4694C] py-3.5 px-2 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-black/20 scale-[1.03] transition-all cursor-pointer font-bold"
                        >
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white">
                            {item.dayName}
                          </span>
                          <span className="text-lg sm:text-2xl font-extrabold mt-0.5 text-white">
                            {item.dayNum}
                          </span>
                        </button>
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
                        className="flex-1 bg-[#3D5F5F]/70 border border-white/20 hover:bg-[#3D5F5F] hover:border-white/40 text-[#F5F2EC] py-3.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group"
                      >
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#F5F2EC]/80 group-hover:text-white">
                          {item.dayName}
                        </span>
                        <span className="text-lg sm:text-2xl font-bold text-white mt-0.5">
                          {item.dayNum}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Info Capsule Pill */}
                <div className="bg-[#3D5F5F]/90 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs text-[#F5F2EC]/90 mb-6 font-sans">
                  <Info className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>
                    Selected:{" "}
                    <strong className="font-bold text-[#F5F2EC] ml-0.5">
                      {formatDateLabel(selectedDate, "EEE d MMM")}
                    </strong>
                  </span>
                </div>

                {/* CTA Button: Continue to Details */}
                <button
                  type="button"
                  onClick={handleContinueToDetails}
                  className="w-full bg-[#F4694C] hover:bg-[#E05538] text-white font-semibold py-3.5 px-6 rounded-full text-sm sm:text-base shadow-lg shadow-[#F4694C]/25 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-[0.99]"
                >
                  Continue to Details →
                </button>
              </div>
            </div>
          ) : (
            /* ── STATE B: STEP 3 • CLIENT INFORMATION (Tell us about you) ── */
            <div className="bg-[#3D5F5F] border border-[#4E7676] rounded-[26px] p-6 sm:p-8 text-[#F5F2EC] shadow-2xl relative overflow-hidden animate-in fade-in-50 duration-200">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Top Row: Tagline + Back to date button */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#F5F2EC]/80 font-sans">
                    STEP 3 • CLIENT INFORMATION
                  </span>
                  <button
                    type="button"
                    onClick={handleBackToDate}
                    className="text-xs text-[#F5F2EC]/80 hover:text-white font-medium transition-colors cursor-pointer flex items-center gap-1 font-sans"
                  >
                    ← Back to date
                  </button>
                </div>

                {/* Title */}
                <h2 className="font-serif text-3xl sm:text-[34px] font-normal leading-tight text-[#F5F2EC] mb-2">
                  Tell us about{" "}
                  <em className="font-serif italic font-normal text-[#F5F2EC]">
                    you
                  </em>
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-[#F5F2EC]/85 font-sans leading-relaxed mb-6 max-w-xl">
                  We&apos;ll send instant booking reminders and preparation sheets.
                </p>

                {/* Form Fields */}
                <div className="space-y-4 font-sans">
                  {/* Field 1: Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-[#F5F2EC]/80 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative flex items-center bg-[#2B4747] border border-[#4E7676] rounded-xl px-4 py-3 focus-within:border-[#F4694C] transition-colors">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="Your full name"
                        className="bg-transparent text-[#F5F2EC] text-sm font-medium w-full focus:outline-none placeholder:text-[#F5F2EC]/40"
                      />
                      <span className="text-xs text-[#F5F2EC]/70 font-medium shrink-0 ml-2">
                        Patient
                      </span>
                    </div>
                  </div>

                  {/* Field 2: Phone Number */}
                  <div>
                    <label className="block text-xs font-medium text-[#F5F2EC]/80 mb-1.5">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2.5">
                      <div className="bg-[#2B4747] border border-[#4E7676] rounded-xl px-4 py-3 text-sm font-semibold text-[#F5F2EC] shrink-0">
                        +91
                      </div>
                      <div className="bg-[#2B4747] border border-[#4E7676] rounded-xl px-4 py-3 text-sm font-medium text-[#F5F2EC] flex-1 focus-within:border-[#F4694C] transition-colors">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          placeholder="10-digit mobile number"
                          className="bg-transparent text-[#F5F2EC] text-sm font-medium w-full focus:outline-none placeholder:text-[#F5F2EC]/40"
                        />
                      </div>
                    </div>
                    {/* Verified hint */}
                    {normalizePhoneDigits(phone).length === 10 ? (
                      <p className="text-xs text-[#34D399] font-medium mt-2 flex items-center gap-1.5 font-sans">
                        <span className="text-sm">✓</span>
                        <span>Mobile number verified for SMS &amp; 24h reminders</span>
                      </p>
                    ) : (
                      <p className="text-xs text-[#F5F2EC]/75 mt-2 font-sans">
                        Enter 10-digit mobile number for automated 24h WhatsApp confirmation
                      </p>
                    )}
                  </div>

                  {/* Field 3: Primary Goal / Note (Optional) */}
                  <div>
                    <label className="block text-xs font-medium text-[#F5F2EC]/80 mb-1.5">
                      Primary Goal / Note (Optional)
                    </label>
                    <div className="bg-[#2B4747] border border-[#4E7676] rounded-xl px-4 py-3 focus-within:border-[#F4694C] transition-colors">
                      <input
                        type="text"
                        value={patientGoal}
                        onChange={(e) => {
                          setPatientGoal(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="e.g. Hormonal balance and sustained energy"
                        className="bg-transparent text-[#F5F2EC] text-sm font-medium w-full focus:outline-none placeholder:text-[#F5F2EC]/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Review & Confirm Button */}
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting || !isFormValid}
                  className="w-full bg-[#F4694C] hover:bg-[#E05538] text-white font-semibold py-3.5 px-6 rounded-full text-base shadow-lg shadow-[#F4694C]/25 transition-all mt-6 cursor-pointer text-center font-sans active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Securing booking..." : "Review & Confirm →"}
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STEP 2 CARD: TIME SLOT SELECTION ("Choose a time slot")
          ═══════════════════════════════════════════════════════════ */}
          <div
            id="time-slots-section"
            className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[24px] p-6 sm:p-7 shadow-xl scroll-mt-6 font-sans"
          >
            {/* Header */}
            <h3 className="font-serif text-2xl font-normal text-[#F5F2EC]">
              Choose a{" "}
              <em className="font-serif italic font-normal text-[#F5F2EC]">
                time slot
              </em>
            </h3>
            <p className="text-xs text-[#B8B8BC] mt-1 font-sans">
              Times shown in IST (GMT +5:30) • 30-min schedule grid
            </p>

            {/* Fixed Slots Grid (4 cols x rows) */}
            {slotsLoading && availableSlots.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-14 bg-[#323235] border border-[#3A3A3C] rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.time;
                  const isBooked = !slot.available;

                  if (isSelected) {
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        className="bg-[#F4694C] text-white border border-[#F4694C] rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-md shadow-[#F4694C]/25 font-semibold text-xs sm:text-sm cursor-pointer scale-[1.02] transition-all"
                      >
                        <span>{formatTimeLabel(slot.time)}</span>
                        <span className="text-[10px] font-normal text-white/90">
                          (Selected)
                        </span>
                      </button>
                    );
                  }

                  if (isBooked) {
                    return (
                      <div
                        key={slot.time}
                        className="bg-[#222224] border border-[#2A2A2C] text-[#6E6E73] line-through rounded-2xl py-3.5 px-2 flex flex-col items-center justify-center text-xs sm:text-sm font-medium cursor-not-allowed select-none opacity-60"
                      >
                        <span>{formatTimeLabel(slot.time)}</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => {
                        setSelectedTimeSlot(slot.time);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="bg-[#323235] border border-[#3A3A3C] hover:border-[#F4694C]/60 hover:bg-[#38383C] text-[#F5F2EC] rounded-2xl py-3.5 px-2 flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all cursor-pointer"
                    >
                      <span>{formatTimeLabel(slot.time)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (lg:col-span-4): BOOKING SUMMARY CARD ── */}
        <div className="lg:col-span-4">
          <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[24px] p-6 lg:p-7 shadow-xl lg:sticky lg:top-6 font-sans">
            {/* Header */}
            <span className="text-[11px] font-semibold tracking-wider text-[#B8B8BC] uppercase block">
              BOOKING SUMMARY
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#F5F2EC] mt-1 tracking-tight">
              Clinical Nutrition Session
            </h3>
            <p className="text-xs text-[#B8B8BC] mt-0.5 mb-5">
              45-Minute 1-on-1 Comprehensive Care
            </p>

            {/* Doctor Box */}
            <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl p-3.5 flex items-center gap-3.5 mb-6">
              {/* Doctor Avatar with online dot */}
              <div className="relative w-11 h-11 rounded-full shrink-0 border border-[#3A3A3C] bg-[#365744] flex items-center justify-center">
                <User className="w-5 h-5 text-[#F5F2EC]" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#34D399] ring-2 ring-[#1C1C1E]" />
              </div>

              <div>
                <span className="text-sm font-semibold text-[#F5F2EC] block leading-tight">
                  Dr. Kayro
                </span>
                <span className="text-xs text-[#B8B8BC] block mt-0.5">
                  Chief Clinical Nutritionist (PhD)
                </span>
              </div>
            </div>

            {/* Details Table */}
            <div className="space-y-3.5 py-4 border-t border-b border-[#3A3A3C]/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#B8B8BC]">Date</span>
                <span className="text-[#F5F2EC] font-medium text-right">
                  {formatDateLabel(selectedDate, "EEEE, d MMM yyyy")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#B8B8BC]">Time</span>
                <span className="text-[#F5F2EC] font-medium text-right">
                  {formatTimeLabel(selectedTimeSlot)} – {formatEndTime(selectedTimeSlot, 45)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#B8B8BC]">Session format</span>
                <span className="text-[#34D399] font-semibold text-right">
                  In-Clinic Consult
                </span>
              </div>
            </div>

            {/* Confirm booking CTA button */}
            <button
              type="button"
              disabled={isSubmitting || !isFormValid}
              onClick={handleConfirmBooking}
              className="w-full bg-[#F4694C] hover:bg-[#E05538] text-white font-semibold py-3.5 rounded-full text-base shadow-lg shadow-[#F4694C]/25 transition-all mt-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Securing booking..." : "Confirm booking"}
            </button>

            {/* Footnote */}
            <p className="text-center text-xs text-[#6E6E73] mt-3.5 font-sans leading-relaxed">
              24-hour free cancellation policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
