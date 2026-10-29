"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/DatePicker";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { Calendar, User, Phone, Clock, AlertCircle } from "lucide-react";
import { getSlotsForDate, getTomorrowStr, normalizePhoneDigits } from "@/lib/data";
import { formatTimeLabel } from "@/lib/utils";

interface AddAppointmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile?: boolean;
}

export function AddAppointmentSheet({
  open,
  onOpenChange,
  isMobile = false,
}: AddAppointmentSheetProps) {
  const { addAppointmentByAdmin } = useRole();

  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowStr());
  const [selectedTime, setSelectedTime] = useState<string>("10:00");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      setClientName("");
      setPhone("");
      setSelectedDate(getTomorrowStr());
      setSelectedTime("10:00");
      setErrorMessage(null);
    }
  }, [open]);

  // Load slots dynamically from Supabase
  const loadSlots = async () => {
    const data = await getSlotsForDate(selectedDate);
    setSlots(data);
  };

  useEffect(() => {
    if (open) {
      loadSlots();
    }
  }, [selectedDate, open]);

  const phoneDigits = normalizePhoneDigits(phone);
  const isFormValid = clientName.trim().length > 0 && phoneDigits.length === 10;

  const handleSave = async () => {
    if (!isFormValid || isSaving) return;
    setErrorMessage(null);
    setIsSaving(true);

    const result = await addAppointmentByAdmin({
      clientName: clientName.trim(),
      phone: phoneDigits,
      date: selectedDate,
      time: selectedTime,
    });

    setIsSaving(false);

    if (!result.ok) {
      if (result.reason === "slot_taken") {
        setErrorMessage("That slot was just taken, please pick another.");
        await loadSlots();
      } else {
        setErrorMessage("Could not schedule appointment. Please pick another slot.");
      }
      return;
    }

    onOpenChange(false);
    setClientName("");
    setPhone("");
    setErrorMessage(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="overflow-y-auto bg-[#2A2A2C] border-[#3A3A3C] sm:max-w-[440px]"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="font-serif text-2xl font-normal text-[#F5F2EC]">
            Add <em className="italic text-[#F4694C]">Appointment</em>
          </SheetTitle>
          <SheetDescription className="text-xs text-[#B8B8BC]">
            Schedule a new patient consultation in Dr. Kayro&apos;s calendar.
          </SheetDescription>
        </SheetHeader>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-5 pb-6">
          {/* Client Name */}
          <div>
            <label className="text-xs font-semibold text-[#B8B8BC] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#F4694C]" />
              Client Full Name *
            </label>
            <Input
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Radhika Apte"
              className="bg-[#1C1C1E] border-[#3A3A3C] text-sm text-[#F5F2EC]"
              required
            />
          </div>

          {/* WhatsApp Phone */}
          <div>
            <label className="text-xs font-semibold text-[#B8B8BC] mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#34D399]" />
              WhatsApp Phone Number (+91) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm text-[#B8B8BC]">
                +91
              </span>
              <Input
                className="pl-12 bg-[#1C1C1E] border-[#3A3A3C] text-sm text-[#F5F2EC] tabular-nums"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="98200 XXXXX"
              />
            </div>
            {phone.trim() !== "" && phoneDigits.length !== 10 && (
              <p className="text-[11px] text-amber-400 mt-1">
                Enter 10-digit mobile number
              </p>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-xs font-semibold text-[#B8B8BC] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#F4694C]" />
              Consultation Date
            </label>
            <DatePicker
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                if (errorMessage) setErrorMessage(null);
              }}
            />
          </div>

          {/* Time slot grid (3 cols) */}
          <div>
            <label className="text-xs font-semibold text-[#B8B8BC] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F4694C]" />
                Time Slot
              </span>
              <span className="text-[11px] text-[#B8B8BC]/70">
                Selected: {formatTimeLabel(selectedTime)}
              </span>
            </label>
            <div className="bg-[#1C1C1E] border border-[#3A3A3C] p-3 rounded-2xl">
              <TimeSlotPicker
                slots={slots}
                selectedTime={selectedTime}
                onSelectTime={(t) => {
                  setSelectedTime(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                columns={3}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="mt-4 border-t border-[#3A3A3C] pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            variant="coral"
            className="rounded-full text-xs disabled:opacity-40"
          >
            {isSaving ? "Saving..." : "Save Appointment"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
