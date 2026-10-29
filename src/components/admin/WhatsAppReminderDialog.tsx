"use client";

import React from "react";
import { Appointment, getTomorrowStr, getTodayStr } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCheck, MessageSquare } from "lucide-react";
import {
  formatDateLabel,
  formatTimeLabel,
  formatPhone,
  normalizePhone,
} from "@/lib/utils";

interface WhatsAppReminderDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsAppReminderDialog({
  appointment,
  open,
  onOpenChange,
}: WhatsAppReminderDialogProps) {
  if (!appointment) return null;

  const clientFirstName = appointment.clientName.trim().split(" ")[0] || "there";
  const isTomorrow = appointment.date === getTomorrowStr();
  const isToday = appointment.date === getTodayStr();
  const dateRef = isTomorrow
    ? `tomorrow, ${formatDateLabel(appointment.date, "EEEE d MMM")}`
    : isToday
    ? `today, ${formatDateLabel(appointment.date, "EEEE d MMM")}`
    : `on ${formatDateLabel(appointment.date, "EEEE d MMM")}`;
  const timeStr = formatTimeLabel(appointment.time);
  const messageBody = `Hi ${clientFirstName}, your session with Dr. Kayro is ${dateRef} at ${timeStr}. Reply YES to confirm or tell us if you need to reschedule.`;

  const phoneDigits = normalizePhone(appointment.phone);
  const hasValidPhone = Boolean(phoneDigits && phoneDigits.length === 10);

  const handleOpenWhatsApp = () => {
    if (!hasValidPhone) return;
    const url = `https://wa.me/91${phoneDigits}?text=${encodeURIComponent(messageBody)}`;
    window.open(url, "_blank");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#2A2A2C] border-[#3A3A3C] rounded-[24px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366]">
              <MessageSquare className="w-4 h-4" />
            </span>
            <DialogTitle className="font-serif text-2xl font-normal text-[#F5F2EC]">
              Send a <em className="italic text-[#F4694C]">reminder</em>
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#B8B8BC]">
            Quick-dispatch a personalized WhatsApp reminder before the 24h confirmation cutoff.
          </DialogDescription>
        </DialogHeader>

        {/* Client Summary Row */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#3A3A3C] text-xs">
          <div>
            <span className="text-[#B8B8BC] block text-[11px]">Recipient</span>
            <span className="font-semibold text-[#F5F2EC] text-sm">
              {appointment.clientName}
            </span>
          </div>

          <div>
            <span className="text-[#B8B8BC] block text-[11px]">Phone</span>
            <span className="tabular-nums text-[#F5F2EC]">
              {hasValidPhone ? `+91 ${formatPhone(appointment.phone)}` : "Missing"}
            </span>
          </div>

          <div>
            <span className="text-[#B8B8BC] block text-[11px]">Appointment</span>
            <span className="font-semibold text-[#F4694C]">
              {timeStr}
            </span>
          </div>
        </div>

        {/* Dark WhatsApp Chat Bubble Preview */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B8B8BC] block">
            WhatsApp Preview
          </span>

          <div className="p-4 rounded-2xl bg-[#0B141A] border border-[#202C33] relative">
            <div className="flex justify-end">
              <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-[#005C4B] p-3 text-xs text-[#E9EDEF] shadow-md space-y-1.5 border border-[#128C7E]/40">
                <p className="leading-relaxed whitespace-pre-wrap">{messageBody}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-[#A6CCB8]">
                  <span>10:42 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                </div>
              </div>
            </div>
          </div>
          {!hasValidPhone && (
            <p className="text-[11px] text-amber-400">
              Add a phone number first to send WhatsApp reminders.
            </p>
          )}
        </div>

        <DialogFooter className="mt-2 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleOpenWhatsApp}
            disabled={!hasValidPhone}
            variant="outline"
            className="rounded-full text-xs gap-2 border-[#3A3A3C] text-[#F5F2EC] hover:bg-[#3A3A3C] disabled:opacity-40"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
            Open WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
