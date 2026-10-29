"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  User,
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
  isWithin24h,
  isPastAppointment,
} from "@/lib/utils";

export function ClientAppointments() {
  const {
    appointments,
    upcomingClientAppointments,
    pastClientAppointments,
    selectedAppointmentId,
    setSelectedAppointmentId,
    confirmAppointment,
    cancelAppointment,
    setActiveRescheduleId,
    setClientScreen,
    loading,
    error,
    refetch,
  } = useRole();

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetCancelId, setTargetCancelId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

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

  const handleConfirmCancel = async () => {
    if (targetCancelId && !isCancelling) {
      setIsCancelling(true);
      try {
        await cancelAppointment(targetCancelId);
        setCancelModalOpen(false);
        setTargetCancelId(null);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const handleConfirmAction = async (id: string) => {
    if (!isConfirming) {
      setIsConfirming(true);
      try {
        await confirmAppointment(id);
      } finally {
        setIsConfirming(false);
      }
    }
  };

  const activeRescheduledFrom = activeAppointment?.rescheduledFrom
    ? appointments.find((a) => a.id === activeAppointment.rescheduledFrom)
    : null;

  const isActiveSession =
    activeAppointment &&
    activeAppointment.status === "Booked" &&
    activeAppointment.clientAction === "none" &&
    !isPastAppointment(activeAppointment);

  const renderBadgeForAppointment = (apt: typeof activeAppointment) => {
    if (!apt) return null;
    if (apt.clientAction === "Cancelled") {
      return <StatusBadge status="Cancelled" size="sm" />;
    }
    if (apt.clientAction === "Rescheduled") {
      return <StatusBadge status="Rescheduled" size="sm" />;
    }
    if (apt.status === "Done") {
      return <StatusBadge status="Done" size="sm" />;
    }
    if (apt.status === "Booked" && isPastAppointment(apt)) {
      return <StatusBadge status="Awaiting update" size="sm" />;
    }
    if (apt.status === "No-show") {
      return <StatusBadge status="Missed" size="sm" />;
    }
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <StatusBadge status={apt.status} size="sm" />
        <StatusBadge status={apt.confirmed} size="sm" />
      </div>
    );
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

      {error && displayList.length === 0 && !loading && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            onClick={() => refetch()}
            size="sm"
            variant="outline"
            className="text-xs h-8 rounded-full border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Master - Detail Layout (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Appointments List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="space-y-3">
              <div className="p-4 rounded-[22px] bg-[#2A2A2C] border border-[#3A3A3C] h-32 animate-pulse" />
              <div className="p-4 rounded-[22px] bg-[#2A2A2C] border border-[#3A3A3C] h-32 animate-pulse" />
            </div>
          ) : displayList.length === 0 ? (
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
              const rescheduledFrom = apt.rescheduledFrom
                ? appointments.find((a) => a.id === apt.rescheduledFrom)
                : null;
              const isPastItem = tab === "past";

              return (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointmentId(apt.id)}
                  className={cn(
                    "p-4 rounded-[22px] bg-[#2A2A2C] border transition-all duration-150 cursor-pointer text-left relative",
                    isPastItem && "opacity-80 hover:opacity-100",
                    isSelected
                      ? "border-[#F4694C] ring-1 ring-[#F4694C] bg-[#2e2e32]"
                      : isUrgent
                      ? "border-t-2 border-t-[#F59E0B] border-x-[#3A3A3C] border-b-[#3A3A3C] hover:border-[#F4694C]/40"
                      : "border-[#3A3A3C] hover:border-[#F4694C]/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {renderBadgeForAppointment(apt)}
                    </div>
                    <span className="text-[11px] font-semibold text-[#B8B8BC]">
                      45 min
                    </span>
                  </div>

                  <h4 className="font-serif text-base font-medium text-[#F5F2EC] mb-1">
                    Nutrition consultation
                  </h4>

                  {rescheduledFrom && tab === "upcoming" && (
                    <p className="text-[11px] text-[#B8B8BC] mb-2 font-sans">
                      Rescheduled from {formatDateLabel(rescheduledFrom.date, "EEE d MMM")} · {formatTimeLabel(rescheduledFrom.time)}
                    </p>
                  )}

                  <p className="text-xs text-[#B8B8BC] mb-3">
                    Dr. Kayro
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
          {loading ? (
            <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[24px] p-6 lg:p-8 h-96 animate-pulse" />
          ) : activeAppointment ? (
            <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[24px] p-6 lg:p-8 space-y-6 shadow-xl">
              {/* Header info */}
              <div className="pb-6 border-b border-[#3A3A3C]">
                <div className="flex items-center gap-2 mb-2">
                  {renderBadgeForAppointment(activeAppointment)}
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#F5F2EC]">
                  Nutrition consultation
                </h3>
                {activeRescheduledFrom && (
                  <p className="text-xs text-[#B8B8BC] mt-1.5 font-sans">
                    Rescheduled from {formatDateLabel(activeRescheduledFrom.date, "EEE d MMM")} · {formatTimeLabel(activeRescheduledFrom.time)}
                  </p>
                )}
              </div>

              {/* Doctor details box */}
              <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#3A3A3C] flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#365744] flex items-center justify-center text-white shrink-0">
                  <User className="w-6 h-6 text-[#F5F2EC]" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-medium text-[#F5F2EC]">
                    Dr. Kayro
                  </h4>
                  <p className="text-xs text-[#B8B8BC] mt-0.5">
                    Clinical Nutrition Specialist
                  </p>
                </div>
              </div>

              {/* Consultation timing */}
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
                    {formatTimeLabel(activeAppointment.time)} (45 min)
                  </p>
                  <span className="text-[11px] text-[#B8B8BC]">1-on-1 private consult</span>
                </div>
              </div>

              {/* Action Buttons for Active Booked Sessions only */}
              {isActiveSession && (
                <div className="pt-4 border-t border-[#3A3A3C] flex flex-wrap items-center gap-3">
                  {!activeAppointment.confirmed && (
                    <Button
                      onClick={() => handleConfirmAction(activeAppointment.id)}
                      disabled={isConfirming}
                      variant="coral"
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {isConfirming ? "Confirming..." : "24h Confirm Now"}
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
              Are you sure you want to cancel this appointment with Dr. Kayro?
              Your held time slot will be made available to other patients on the waitlist.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              disabled={isCancelling}
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="default"
              disabled={isCancelling}
              className="bg-[#D64545] hover:bg-[#b83838] text-white"
              onClick={handleConfirmCancel}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
