"use client";

import React, { useState, useEffect } from "react";
import { Appointment, normalizePhoneDigits } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone } from "lucide-react";
import { useRole } from "@/context/RoleContext";

interface EditAppointmentDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAppointmentDialog({
  appointment,
  open,
  onOpenChange,
}: EditAppointmentDialogProps) {
  const { updateAppointment } = useRole();
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (appointment) {
      setClientName(appointment.clientName || "");
      setPhone(appointment.phone || "");
    }
  }, [appointment, open]);

  if (!appointment) return null;

  const phoneDigits = normalizePhoneDigits(phone);
  const isValid =
    clientName.trim().length > 0 &&
    (phone.trim() === "" || phoneDigits.length === 10);

  const handleSave = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    try {
      await updateAppointment(appointment.id, {
        clientName: clientName.trim(),
        phone: phone.trim(),
      });
      onOpenChange(false);
    } catch (e) {
      console.error("Failed to update appointment:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-[#2A2A2C] border-[#3A3A3C] rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal text-[#F5F2EC]">
            Edit <em className="italic text-[#F4694C]">client</em>
          </DialogTitle>
          <DialogDescription className="text-xs text-[#B8B8BC]">
            Update the client&apos;s name or phone number.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-[#B8B8BC] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#F4694C]" />
              Client Full Name *
            </label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client full name"
              className="bg-[#1C1C1E] border-[#3A3A3C] text-sm text-[#F5F2EC]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#B8B8BC] mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#34D399]" />
              Phone (10 digits)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm text-[#B8B8BC]">
                +91
              </span>
              <Input
                className="pl-12 bg-[#1C1C1E] border-[#3A3A3C] text-sm text-[#F5F2EC] tabular-nums"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
              />
            </div>
            {phone.trim() !== "" && phoneDigits.length !== 10 && (
              <p className="text-[11px] text-amber-400 mt-1">
                Must be exactly 10 digits
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            variant="coral"
            className="rounded-full text-xs shadow-md shadow-[#F4694C]/25 disabled:opacity-40"
          >
            {isSaving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

