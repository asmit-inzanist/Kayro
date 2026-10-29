"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Video,
  FileText,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  cn,
  formatDateLabel,
  formatTimeLabel,
  formatPhone,
  isWithin24h,
} from "@/lib/utils";

export function ClientAppointments() {
  const {
    upcomingClientAppointments,
    pastClientAppointments,
    selectedAppointmentId,
    setSelectedAppointmentId,
    confirmAppointment,
    cancelAppointment,
    setActiveRescheduleId,
    setClientScreen,
  } = useRole();

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetCancelId, setTargetCancelId] = useState<string | null>(null);

  const displayList =
    tab === "upcoming" ? upcomingClientAppointments : pastClientAppointments;

  // Active selected appointment for detail pane
  const activeAppointment =
    displayList.find((apt) => apt.id === selectedAppointmentId) ||
    displayList[0] ||
    upcomingClientAppointments[0] ||
    pastClientAppointments[0];

  const handleOpenCancel = (id: string) => {
    setTargetCancelId(id);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (targetCancelId) {
      cancelAppointment(targetCancelId);
      setCancelModalOpen(false);
      setTargetCancelId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#F4694C] uppercase tracking-wider">
            Patient Portal
          </span>
          <h1 className="font-serif text-3xl lg:text-4xl font-normal text-[#F5F2EC] mt-1">
            My <em className="italic">Appointments</em>
          </h1>
          <p className="text-sm text-[#B8B8BC] mt-1">
            Manage your consultations, video call links, and dietary review schedules.
          </p>
        </div>

        {/* Segmented Toggle */}
        <div className="inline-flex p-1 rounded-full bg-[#2A2A2C] border border-[#3A3A3C]">
          <button
            type="button"
            onClick={() => {
              setTab("upcoming");
              if (upcomingClientAppointments[0]) {
                setSelectedAppointmentId(upcomingClientAppointments[0].id);
              }
            }}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer",
              tab === "upcoming"
                ? "bg-[#F4694C] text-[#F5F2EC] shadow-md shadow-[#F4694C]/25"
                : "text-[#B8B8BC] hover:text-[#F5F2EC]"
            )}
          >
            Upcoming ({upcomingClientAppointments.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("past");
              if (pastClientAppointments[0]) {
                setSelectedAppointmentId(pastClientAppointments[0].id);
              }
            }}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer",
              tab === "past"
                ? "bg-[#F4694C] text-[#F5F2EC] shadow-md shadow-[#F4694C]/25"
                : "text-[#B8B8BC] hover:text-[#F5F2EC]"
            )}
          >
            Past History ({pastClientAppointments.length})
          </button>
        </div>
      </div>

      {/* Master - Detail Layout (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Appointments List */}
        <div className="lg:col-span-5 space-y-3">
          {displayList.length === 0 ? (
            <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[24px] p-8 text-center">
              <Calendar className="w-10 h-10 text-[#B8B8BC]/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-[#F5F2EC]">No sessions found</p>
              <p className="text-xs text-[#B8B8BC] mt-1 mb-4">
                You have no {tab} consultations registered.
              </p>
              <Button
                variant="coral"
                size="sm"
                onClick={() => setClientScreen("book")}
              >
                Book a consultation
              </Button>
            </div>
          ) : (
            displayList.map((apt) => {
              const isSelected = activeAppointment?.id === apt.id;
              const isUrgent = isWithin24h(apt) && !apt.confirmed;

              return (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointmentId(apt.id)}
                  className={cn(
                    "p-4 rounded-[22px] bg-[#2A2A2C] border transition-all duration-150 cursor-pointer text-left relative",
                    isSelected
                      ? "border-[#F4694C] ring-1 ring-[#F4694C] bg-[#2e2e32]"
                      : isUrgent
                      ? "border-t-2 border-t-[#F59E0B] border-x-[#3A3A3C] border-b-[#3A3A3C] hover:border-[#F4694C]/40"
                      : "border-[#3A3A3C] hover:border-[#F4694C]/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <StatusBadge status={apt.status} size="sm" />
                      {apt.status === "Booked" && (
                        <StatusBadge status={apt.confirmed} size="sm" />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-[#B8B8BC]">
                      45 min
                    </span>
                  </div>

                  <h4 className="font-serif text-base font-medium text-[#F5F2EC] mb-1">
                    Clinical Nutrition Consultation
                  </h4>
                  <p className="text-xs text-[#B8B8BC] mb-3">
                    Dr. Anika Mehta
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#F5F2EC] bg-[#1C1C1E] rounded-xl px-3 py-1.5 border border-[#3A3A3C]/60">
                    <span className="font-medium text-[#F4694C]">
                      {formatDateLabel(apt.date)}
                    </span>
                    <span className="text-[#B8B8BC]">
                      {formatTimeLabel(apt.time)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (7 cols): Detail Pane */}
        <div className="lg:col-span-7">
          {activeAppointment ? (
            <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[24px] p-6 lg:p-8 space-y-6 shadow-xl">
              {/* Header info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#3A3A3C]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={activeAppointment.status} />
                    {activeAppointment.status === "Booked" && (
                      <StatusBadge status={activeAppointment.confirmed} />
                    )}
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-[#F5F2EC]">
                    Clinical Nutrition Consultation
                  </h3>
                  <p className="text-xs text-[#B8B8BC] mt-1">
                    Booking ID: <span className="font-mono text-[#F5F2EC]">{activeAppointment.id.toUpperCase()}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#B8B8BC] block">Consultation Fee</span>
                  <span className="font-serif text-2xl font-bold text-[#F5F2EC]">
                    ₹2,400
                  </span>
                  <span className="text-[10px] text-[#34D399] block">✓ Verified Paid</span>
                </div>
              </div>

              {/* Doctor details box */}
              <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#3A3A3C] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#365744] flex items-center justify-center font-serif text-lg font-bold text-white shrink-0">
                    AM
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-[#F5F2EC]">
                      Dr. Anika Mehta
                    </h4>
                    <p className="text-xs text-[#B8B8BC]">
                      Clinical Nutrition Specialist • AFPA Certified
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/919820011111?text=Hi%20Dr.%20Anika`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#2A2A2C] border border-[#3A3A3C] text-[#34D399] hover:bg-[#3A3A3C] transition-colors"
                  title="WhatsApp Doctor"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Consultation timing & room link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#2A2A2C] border border-[#3A3A3C] space-y-1">
                  <span className="text-xs text-[#B8B8BC] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#F4694C]" /> Date &amp; Day
                  </span>
                  <p className="text-sm font-semibold text-[#F5F2EC]">
                    {formatDateLabel(activeAppointment.date, "EEEE, d MMM yyyy")}
                  </p>
                  <span className="text-[11px] text-[#B8B8BC]">IST (UTC+05:30)</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#2A2A2C] border border-[#3A3A3C] space-y-1">
                  <span className="text-xs text-[#B8B8BC] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F4694C]" /> Time &amp; Duration
                  </span>
                  <p className="text-sm font-semibold text-[#F5F2EC]">
                    {formatTimeLabel(activeAppointment.time)} (45 mins)
                  </p>
                  <span className="text-[11px] text-[#B8B8BC]">1-on-1 private video</span>
                </div>
              </div>

              {/* Video call room */}
              <div className="p-5 rounded-2xl bg-[#365744]/15 border border-[#365744]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#34D399]" />
                    <span className="text-xs font-semibold text-[#F5F2EC]">
                      Google Meet Telehealth Room
                    </span>
                  </div>
                  <span className="text-[11px] text-[#34D399] font-medium bg-[#34D399]/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#B8B8BC]">
                  Room unlocks 10 minutes prior to your consultation time.
                </p>
                <a
                  href="https://meet.google.com/nourish-anika-riya"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-[#34D399] hover:bg-[#2dbb85] text-[#1C1C1E] text-xs font-semibold transition-colors"
                >
                  Open Consultation Room <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Consultation Focus & Protocol Notes */}
              <div className="p-5 rounded-2xl bg-[#1C1C1E] border border-[#3A3A3C] space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F4694C]" />
                  <h5 className="text-xs font-semibold text-[#F5F2EC] uppercase tracking-wider">
                    Clinical Focus &amp; Pre-consult Notes
                  </h5>
                </div>
                <p className="text-xs text-[#B8B8BC] leading-relaxed">
                  Review microbiome panel results and adjust FODMAP elimination plan. Focus on evening bloating and energy dip.
                </p>
              </div>

              {/* Tags */}
              <div>
                <span className="text-xs text-[#B8B8BC] block mb-2 font-medium">
                  Associated Clinical Focus Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {["Video Call", "Gut Health Protocol", "Diet Plan"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs bg-[#2A2A2C] border border-[#3A3A3C] text-[#F5F2EC]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Booked Sessions */}
              {activeAppointment.status === "Booked" && (
                <div className="pt-4 border-t border-[#3A3A3C] flex flex-wrap items-center gap-3">
                  {!activeAppointment.confirmed && (
                    <Button
                      onClick={() => confirmAppointment(activeAppointment.id)}
                      variant="coral"
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      24h Confirm Now
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      setActiveRescheduleId(activeAppointment.id);
                      setClientScreen("reschedule");
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>

                  <Button
                    onClick={() => handleOpenCancel(activeAppointment.id)}
                    variant="ghost"
                    className="text-[#D64545] hover:text-[#D64545] hover:bg-[#D64545]/10"
                  >
                    Cancel Session
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[24px] p-12 text-center text-[#B8B8BC]">
              Select an appointment to view details
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#D64545]">
              Cancel Consultation?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#B8B8BC] pt-2">
              Are you sure you want to cancel this appointment with Dr. Anika Mehta?
              Your held time slot will be made available to other patients on the waitlist.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="default"
              className="bg-[#D64545] hover:bg-[#b83838] text-white"
              onClick={handleConfirmCancel}
            >
              Yes, Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
