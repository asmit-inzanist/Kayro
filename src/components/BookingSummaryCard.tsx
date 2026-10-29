"use client";

import React from "react";
import { Calendar, Clock, MapPin, ShieldCheck, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateLabel, formatTimeLabel, formatEndTime } from "@/lib/utils";

interface BookingSummaryCardProps {
  date: string;
  time: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function BookingSummaryCard({
  date,
  time,
  onConfirm,
  isLoading = false,
}: BookingSummaryCardProps) {
  const displayDate = formatDateLabel(date, "EEEE, d MMM yyyy");
  const displayTime = formatTimeLabel(time);
  const displayEndTime = formatEndTime(time, 45);

  return (
    <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[24px] p-6 shadow-xl sticky top-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#3A3A3C]">
        <div className="w-12 h-12 rounded-full bg-[#365744] flex items-center justify-center text-[#F5F2EC] shrink-0 border border-[#365744]/60">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-medium text-[#F5F2EC]">
            Dr. Kayro
          </h3>
          <p className="text-xs text-[#B8B8BC]">
            M.Sc Clinical Nutrition, AFPA Certified
          </p>
        </div>
      </div>

      <div className="py-5 space-y-3.5 border-b border-[#3A3A3C]">
        <div className="flex items-center gap-3 text-sm text-[#F5F2EC]">
          <Calendar className="w-4 h-4 text-[#F4694C] shrink-0" />
          <span>{displayDate}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#F5F2EC]">
          <Clock className="w-4 h-4 text-[#F4694C] shrink-0" />
          <span>
            {displayTime} {displayEndTime ? `– ${displayEndTime}` : ""} (45 mins)
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#F5F2EC]">
          <MapPin className="w-4 h-4 text-[#34D399] shrink-0" />
          <span>In-Clinic Consult</span>
        </div>
      </div>

      {/* Benefits checklist */}
      <div className="py-4 space-y-2 text-xs text-[#B8B8BC]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Personalized Gut &amp; Hormone Protocol</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
          <span>Post-session meal guides &amp; supplement review</span>
        </div>
      </div>

      {/* Action */}
      <div className="pt-2">
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full text-base font-semibold py-3 h-12 shadow-lg shadow-[#F4694C]/25"
        >
          {isLoading ? "Securing appointment..." : "Confirm Consultation"}
        </Button>

        <p className="text-center text-[11px] text-[#B8B8BC]/70 mt-3">
          Free cancellation up to 6 hours before consultation
        </p>
      </div>
    </div>
  );
}
