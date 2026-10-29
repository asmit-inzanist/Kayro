"use client";

import React from "react";
import { Appointment } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import {
  cn,
  formatDateLabel,
  formatTimeLabel,
  isWithin24h,
} from "@/lib/utils";

interface AppointmentCardProps {
  appointment: Appointment;
  onSelect?: () => void;
  onReschedule?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export function AppointmentCard({
  appointment,
  onSelect,
  onReschedule,
  onConfirm,
  isSelected = false,
  showActions = true,
}: AppointmentCardProps) {
  const isUrgent = isWithin24h(appointment) && !appointment.confirmed;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative group bg-[#2A2A2C] border transition-all duration-200 rounded-[22px] p-5 cursor-pointer overflow-hidden",
        isUrgent
          ? "border-t-2 border-t-[#F59E0B] border-x-[#3A3A3C] border-b-[#3A3A3C] shadow-lg shadow-[#F59E0B]/5"
          : "border-[#3A3A3C] hover:border-[#F4694C]/40",
        isSelected && "ring-2 ring-[#F4694C] border-[#F4694C]"
      )}
    >
      {/* Urgent indicator strip */}
      {isUrgent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F59E0B] to-[#F4694C]" />
      )}

      {/* Header with status badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={appointment.status} size="sm" />
          {appointment.status === "Booked" && (
            <StatusBadge status={appointment.confirmed} size="sm" />
          )}
        </div>
        <span className="text-xs font-semibold text-[#B8B8BC]">45 min</span>
      </div>

      {/* Appointment Title & Doctor */}
      <h4 className="font-serif text-lg font-medium text-[#F5F2EC] mb-1 group-hover:text-[#F4694C] transition-colors">
        Clinical Nutrition Consultation
      </h4>
      <p className="text-xs text-[#B8B8BC] mb-4">With Dr. Kayro</p>

      {/* Date & Time pills */}
      <div className="flex flex-wrap items-center gap-3 py-2 px-3 rounded-xl bg-[#1C1C1E] border border-[#3A3A3C]/60 text-xs text-[#F5F2EC] mb-4">
        <div className="flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#F4694C]" />
          <span>{formatDateLabel(appointment.date)}</span>
        </div>
        <span className="text-[#3A3A3C]">•</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#B8B8BC]" />
          <span>{formatTimeLabel(appointment.time)}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#2A2A2C] text-[#B8B8BC] border border-[#3A3A3C]/40">
          Video Call
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#2A2A2C] text-[#B8B8BC] border border-[#3A3A3C]/40">
          Clinical Nutrition
        </span>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#3A3A3C]/60">
          {appointment.status === "Booked" ? (
            <div className="flex items-center gap-2 w-full">
              {!appointment.confirmed && onConfirm && (
                <Button
                  size="sm"
                  variant="coral"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirm();
                  }}
                  className="text-xs flex-1"
                >
                  Confirm Now
                </Button>
              )}
              {onReschedule && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReschedule();
                  }}
                  className="text-xs flex-1"
                >
                  Reschedule
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-xs text-[#B8B8BC]">
              <span>Completed session</span>
              <span className="text-[#F4694C] flex items-center gap-1 hover:underline">
                View summary <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
