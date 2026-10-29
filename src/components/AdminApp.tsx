"use client";

import React, { useState, useMemo } from "react";
import { useRole } from "@/context/RoleContext";
import { Appointment, getNow, getTodayStr } from "@/lib/data";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { SunMascot } from "@/components/SunMascot";
import { StatusDropdown } from "@/components/admin/StatusDropdown";
import { AddAppointmentSheet } from "@/components/admin/AddAppointmentSheet";
import { WhatsAppReminderDialog } from "@/components/admin/WhatsAppReminderDialog";
import { EditAppointmentDialog } from "@/components/admin/EditAppointmentDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  MessageSquare,
  AlertTriangle,
  MoreVertical,
  CheckCircle2,
  Filter,
  Users,
  ChevronDown,
  Trash2,
  RotateCcw,
  Pencil,
} from "lucide-react";
import {
  cn,
  formatDateLabel,
  formatTimeLabel,
  formatPhone,
  isWithin24h,
  isPastAppointment,
  getAppointmentDateTime,
  normalizePhone,
} from "@/lib/utils";

export function AdminApp() {
  const {
    appointments,
    loading,
    error,
    refetch,
    updateAppointmentStatus,
    confirmAppointment,
    deleteAppointment,
    adminFilter,
    setAdminFilter,
    resetDemoData,
  } = useRole();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [selectedWhatsAppApt, setSelectedWhatsAppApt] = useState<Appointment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditApt, setSelectedEditApt] = useState<Appointment | null>(null);

  // 1. SORTED APPOINTMENTS
  // Rule: Unconfirmed Booked within 24h first -> Upcoming Booked by date/time -> Past newest first
  const sortedAppointments = useMemo(() => {
    const urgent: Appointment[] = [];
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    appointments.forEach((apt) => {
      const isPast =
        apt.status === "Done" ||
        apt.status === "No-show" ||
        apt.clientAction === "Cancelled" ||
        apt.clientAction === "Rescheduled" ||
        (apt.status === "Booked" && isPastAppointment(apt));

      if (isPast) {
        past.push(apt);
      } else if (apt.status === "Booked" && apt.clientAction === "none" && !apt.confirmed && isWithin24h(apt)) {
        urgent.push(apt);
      } else {
        upcoming.push(apt);
      }
    });

    // Urgent: date/time ascending
    urgent.sort((a, b) => getAppointmentDateTime(a).getTime() - getAppointmentDateTime(b).getTime());

    // Upcoming: date/time ascending
    upcoming.sort((a, b) => getAppointmentDateTime(a).getTime() - getAppointmentDateTime(b).getTime());

    // Past: newest first (date/time descending)
    past.sort((a, b) => getAppointmentDateTime(b).getTime() - getAppointmentDateTime(a).getTime());

    return [...urgent, ...upcoming, ...past];
  }, [appointments]);

  // 2. METRICS (Computed from the same single source of truth)
  const todayCount = useMemo(() => {
    const todayStr = getTodayStr();
    return appointments.filter(
      (apt) => apt.date === todayStr && apt.status === "Booked" && apt.clientAction === "none" && !isPastAppointment(apt)
    ).length;
  }, [appointments]);

  const upcomingCount = useMemo(() => {
    return appointments.filter(
      (apt) => apt.status === "Booked" && apt.clientAction === "none" && !isPastAppointment(apt)
    ).length;
  }, [appointments]);

  const needsConfirmationCount = useMemo(() => {
    return appointments.filter(
      (apt) =>
        apt.status === "Booked" &&
        apt.clientAction === "none" &&
        !apt.confirmed &&
        !isPastAppointment(apt)
    ).length;
  }, [appointments]);

  const pastCount = useMemo(() => {
    return appointments.filter(
      (apt) =>
        apt.status === "Done" ||
        apt.status === "No-show" ||
        apt.clientAction === "Cancelled" ||
        apt.clientAction === "Rescheduled" ||
        (apt.status === "Booked" && isPastAppointment(apt))
    ).length;
  }, [appointments]);

  const noShowRate = useMemo(() => {
    const doneCount = appointments.filter((apt) => apt.status === "Done").length;
    const noShowCount = appointments.filter((apt) => apt.status === "No-show").length;
    const total = doneCount + noShowCount;
    return total > 0 ? Math.round((noShowCount / total) * 100) : 0;
  }, [appointments]);

  // Unconfirmed upcoming within 24 hours of getNow()
  const unconfirmedNext24hList = useMemo(() => {
    return appointments.filter(
      (apt) =>
        apt.status === "Booked" &&
        apt.clientAction === "none" &&
        !apt.confirmed &&
        isWithin24h(apt)
    );
  }, [appointments]);

  // 3. FILTERED APPOINTMENTS
  const filteredAppointments = useMemo(() => {
    return sortedAppointments.filter((apt) => {
      // 1. Tab filter
      if (adminFilter === "today") {
        const todayStr = getTodayStr();
        if (apt.date !== todayStr || apt.status !== "Booked" || apt.clientAction !== "none" || isPastAppointment(apt)) {
          return false;
        }
      } else if (adminFilter === "upcoming") {
        if (apt.status !== "Booked" || apt.clientAction !== "none" || isPastAppointment(apt)) {
          return false;
        }
      } else if (adminFilter === "past") {
        const isPast =
          apt.status === "Done" ||
          apt.status === "No-show" ||
          apt.clientAction === "Cancelled" ||
          apt.clientAction === "Rescheduled" ||
          (apt.status === "Booked" && isPastAppointment(apt));
        if (!isPast) return false;
      }

      // 2. Status dropdown filter
      if (statusFilter !== "all") {
        if (statusFilter === "Cancelled") {
          if (apt.clientAction !== "Cancelled") return false;
        } else if (statusFilter === "Rescheduled") {
          if (apt.clientAction !== "Rescheduled") return false;
        } else if (apt.status !== statusFilter) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const normQuery = normalizePhone(query);
        const matchName = apt.clientName.toLowerCase().includes(query);
        const matchPhone = apt.phone && (apt.phone.includes(query) || (normQuery && apt.phone.includes(normQuery)));
        const matchDate =
          apt.date.toLowerCase().includes(query) ||
          formatDateLabel(apt.date).toLowerCase().includes(query);
        return Boolean(matchName || matchPhone || matchDate);
      }

      return true;
    });
  }, [sortedAppointments, adminFilter, statusFilter, searchQuery]);

  const handleOpenWhatsAppReminder = (apt: Appointment) => {
    setSelectedWhatsAppApt(apt);
    setWhatsAppModalOpen(true);
  };

  const handleOpenEditDialog = (apt: Appointment) => {
    setSelectedEditApt(apt);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#2A2A2C] rounded-2xl w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[#2A2A2C] rounded-[22px]" />
            ))}
          </div>
          <div className="h-96 bg-[#2A2A2C] rounded-[22px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
        <div className="p-8 rounded-[22px] bg-[#2A2A2C] border border-[#3A3A3C] text-center space-y-3">
          <p className="text-base text-rose-400 font-semibold">Failed to load appointments</p>
          <p className="text-xs text-[#B8B8BC] max-w-md mx-auto">{error}</p>
          <Button size="sm" variant="outline" onClick={refetch} className="rounded-full mt-2">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans pb-24 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#F4694C] uppercase tracking-wider">
            Practice Management • Lead Nutritionist
          </span>
          <h1 className="font-serif text-3xl lg:text-4xl font-normal text-[#F5F2EC] mt-1">
            Good morning, <em className="italic font-normal">Dr. Kayro</em>
          </h1>
          <p className="text-sm text-[#B8B8BC] mt-1">
            {format(getNow(), "EEEE, d MMM yyyy")} • {upcomingCount} consultation{upcomingCount !== 1 ? "s" : ""} scheduled
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => resetDemoData()}
            variant="outline"
            className="rounded-full text-xs text-[#B8B8BC] hover:text-[#F5F2EC] h-11 px-4 gap-1.5"
            title="Restore default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </Button>

          <Button
            onClick={() => setAddSheetOpen(true)}
            variant="coral"
            className="rounded-full h-11 px-6 font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add appointment
          </Button>
        </div>
      </div>

      {/* 2. Summary Strip (4 cards: 2x2 grid on mobile, 4 cols on lg) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Today */}
        <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#B8B8BC] mb-2 font-medium">
            <span>Today</span>
            <Calendar className="w-4 h-4 text-[#B8B8BC]" />
          </div>
          <div className="text-3xl sm:text-4xl font-light font-inter text-[#F5F2EC]">
            {todayCount}
          </div>
          <span className="text-[11px] sm:text-xs text-[#B8B8BC] mt-1 block">Scheduled sessions</span>
        </div>

        {/* Card 2: Upcoming */}
        <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#B8B8BC] mb-2 font-medium">
            <span>Upcoming</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-light font-inter text-sky-300">
            {upcomingCount}
          </div>
          <span className="text-[11px] sm:text-xs text-[#B8B8BC] mt-1 block">Booked sessions</span>
        </div>

        {/* Card 3: Needs Confirmation */}
        <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#B8B8BC] mb-2 font-medium">
            <span>Needs confirmation</span>
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-3xl sm:text-4xl font-light font-inter text-[#F59E0B]">
            {needsConfirmationCount}
          </div>
          <span className="text-[11px] sm:text-xs text-[#B8B8BC] mt-1 block">Pending replies</span>
        </div>

        {/* Card 4: No-show Rate */}
        <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#B8B8BC] mb-2 font-medium">
            <span>No-show rate</span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-light font-inter text-rose-300">
            {noShowRate}%
          </div>
          <span className="text-[11px] sm:text-xs text-[#B8B8BC] mt-1 block">Past sessions</span>
        </div>
      </div>

      {/* 3. Alert Banner (Visible only when unconfirmed appointments in next 24h > 0) */}
      {unconfirmedNext24hList.length > 0 && (
        <div className="bg-[#2A2A2C] border border-[#3A3A3C] border-l-4 border-l-[#F59E0B] rounded-r-[22px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F5F2EC]">
                {unconfirmedNext24hList.length} appointment{unconfirmedNext24hList.length !== 1 ? "s" : ""} in the next 24 hours {unconfirmedNext24hList.length === 1 ? "needs" : "need"} confirmation.
              </p>
              <p className="text-xs text-[#B8B8BC]">
                {unconfirmedNext24hList[0].clientName} ({formatDateLabel(unconfirmedNext24hList[0].date)} at{" "}
                {formatTimeLabel(unconfirmedNext24hList[0].time)}) has not confirmed attendance yet.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => handleOpenWhatsAppReminder(unconfirmedNext24hList[0])}
            className="bg-[#F59E0B] hover:bg-[#c9952e] text-[#1C1C1E] font-semibold rounded-full px-5 h-9 shrink-0 gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Send reminder
          </Button>
        </div>
      )}

      {/* 4. Appointments Table / Cards Container */}
      <div className="bg-[#2A2A2C] border border-[#3A3A3C] rounded-[22px] overflow-hidden shadow-xl">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#3A3A3C] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Pills (All, Today, Upcoming, Past) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(["all", "today", "upcoming", "past"] as const).map((filterVal) => {
              const active = adminFilter === filterVal;
              const count =
                filterVal === "all"
                  ? appointments.length
                  : filterVal === "today"
                  ? todayCount
                  : filterVal === "upcoming"
                  ? upcomingCount
                  : pastCount;

              return (
                <button
                  key={filterVal}
                  type="button"
                  onClick={() => setAdminFilter(filterVal)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize whitespace-nowrap cursor-pointer",
                    active
                      ? "bg-[#F4694C] text-[#F5F2EC] shadow-sm shadow-[#F4694C]/30"
                      : "bg-[#1C1C1E] text-[#B8B8BC] hover:text-[#F5F2EC] border border-[#3A3A3C]"
                  )}
                >
                  {filterVal} ({count})
                </button>
              );
            })}
          </div>

          {/* Search + Status Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-[#B8B8BC] absolute left-3.5 top-3" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-xs bg-[#1C1C1E] border-[#3A3A3C] text-[#F5F2EC] rounded-full"
              />
            </div>

            {/* All statuses dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#1C1C1E] border border-[#3A3A3C] text-xs font-medium text-[#F5F2EC] hover:bg-[#3A3A3C] transition-colors cursor-pointer">
                <Filter className="w-3.5 h-3.5 text-[#B8B8BC]" />
                <span className="capitalize">
                  {statusFilter === "all" ? "All statuses" : statusFilter}
                </span>
                <ChevronDown className="w-3 h-3 text-[#B8B8BC]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-[#2A2A2C] border-[#3A3A3C] text-[#F5F2EC]">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Booked")}>
                  Booked
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Done")}>
                  Done
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("No-show")}>
                  No-show
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Cancelled")}>
                  Cancelled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Rescheduled")}>
                  Rescheduled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          {filteredAppointments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="flex justify-center">
                <SunMascot size={120} />
              </div>
              <h3 className="font-serif text-2xl text-[#F5F2EC]">
                {adminFilter === "today" ? (
                  <>No sessions <em className="italic">today</em></>
                ) : (
                  <>No appointments found</>
                )}
              </h3>
              <p className="text-xs text-[#B8B8BC] max-w-sm mx-auto">
                {adminFilter === "today"
                  ? "Take a moment to review upcoming patient dietary charts or catch up on lab protocols."
                  : "No consultations match your selected filter or search keyword."}
              </p>
              {adminFilter === "today" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAdminFilter("upcoming")}
                  className="rounded-full mt-2"
                >
                  See upcoming appointments
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAdminFilter("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="rounded-full mt-2"
                >
                  Reset filters
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#1C1C1E] sticky top-0 border-b border-[#3A3A3C] text-[#B8B8BC] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Confirmation</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A3A3C]/60 text-[#F5F2EC]">
                {filteredAppointments.map((apt) => {
                  const isHighlighted = apt.clientName === "Riya Shah";
                  const hasPhone = Boolean(normalizePhone(apt.phone));
                  const rescheduledFromApt = apt.rescheduledFrom
                    ? appointments.find((a) => a.id === apt.rescheduledFrom)
                    : null;
                  const isUpcomingActiveBooked =
                    apt.status === "Booked" &&
                    apt.clientAction === "none" &&
                    !isPastAppointment(apt);

                  return (
                    <tr
                      key={apt.id}
                      className={cn(
                        "hover:bg-[#3A3A3C]/50 transition-colors group",
                        isHighlighted && "bg-[#F4694C]/5"
                      )}
                    >
                      {/* Client */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#3A3A3C] border border-[#3A3A3C] flex items-center justify-center text-xs font-semibold text-[#F5F2EC]">
                            {apt.clientName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-[#F5F2EC] group-hover:text-[#F4694C] transition-colors block">
                              {apt.clientName}
                            </span>
                            <span className="text-[11px] text-[#B8B8BC] block">
                              45 min consultation
                            </span>
                            {rescheduledFromApt && (
                              <span className="text-[11px] text-[#B8B8BC] block">
                                Rescheduled from {formatDateLabel(rescheduledFromApt.date, "EEE d MMM")} · {formatTimeLabel(rescheduledFromApt.time)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4 tabular-nums text-sm text-[#B8B8BC]">
                        {hasPhone ? (
                          formatPhone(apt.phone)
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEditDialog(apt)}
                            className="text-[#F59E0B] text-xs hover:underline cursor-pointer"
                          >
                            Add phone
                          </button>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 font-medium text-[#F5F2EC]">
                        {formatDateLabel(apt.date)}
                      </td>

                      {/* Time */}
                      <td className="py-4 px-4 font-medium text-[#F5F2EC]">
                        {formatTimeLabel(apt.time)}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <StatusDropdown
                            status={apt.status}
                            onStatusChange={(newStatus) =>
                              updateAppointmentStatus(apt.id, newStatus)
                            }
                          />
                          {apt.clientAction === "Rescheduled" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-transparent border border-[#3A3A3C] text-[#B8B8BC] text-[10px] font-semibold">
                              Rescheduled
                            </span>
                          )}
                          {apt.clientAction === "Cancelled" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-transparent border border-[#3A3A3C] text-[#B8B8BC] text-[10px] font-semibold">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Confirmation Badge */}
                      <td className="py-4 px-4">
                        {isUpcomingActiveBooked ? (
                          <StatusBadge status={apt.confirmed} size="sm" />
                        ) : (
                          <span className="text-[#B8B8BC] pl-2">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasPhone && (
                            <button
                              type="button"
                              onClick={() => handleOpenWhatsAppReminder(apt)}
                              className="p-1.5 rounded-full hover:bg-[#25D366]/20 text-[#25D366] transition-colors cursor-pointer"
                              title="Send WhatsApp message"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1.5 rounded-full hover:bg-[#3A3A3C] text-[#B8B8BC] hover:text-[#F5F2EC] transition-colors focus:outline-none cursor-pointer">
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#2A2A2C] border-[#3A3A3C] text-[#F5F2EC]">
                              {hasPhone && (
                                <DropdownMenuItem
                                  onClick={() => handleOpenWhatsAppReminder(apt)}
                                  className="gap-2 text-xs"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                                  <span>WhatsApp Reminder</span>
                                </DropdownMenuItem>
                              )}

                              {isUpcomingActiveBooked && !apt.confirmed && (
                                <DropdownMenuItem
                                  onClick={() => confirmAppointment(apt.id)}
                                  className="gap-2 text-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                                  <span>Mark as confirmed</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => handleOpenEditDialog(apt)}
                                className="gap-2 text-xs"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[#B8B8BC]" />
                                <span>Edit client</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  updateAppointmentStatus(
                                    apt.id,
                                    apt.status === "Done" ? "Booked" : "Done"
                                  )
                                }
                                className="gap-2 text-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                                <span>
                                  Mark as {apt.status === "Done" ? "Booked" : "Done"}
                                </span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => deleteAppointment(apt.id)}
                                className="gap-2 text-xs text-[#D64545] hover:text-[#D64545] focus:text-[#D64545]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile View: Stacked Cards (< md) */}
        <div className="md:hidden divide-y divide-[#3A3A3C]/60 p-3 space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#B8B8BC]">
              No consultations match your filter.
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const hasPhone = Boolean(normalizePhone(apt.phone));
              const rescheduledFromApt = apt.rescheduledFrom
                ? appointments.find((a) => a.id === apt.rescheduledFrom)
                : null;
              const isUpcomingActiveBooked =
                apt.status === "Booked" &&
                apt.clientAction === "none" &&
                !isPastAppointment(apt);

              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#3A3A3C] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#3A3A3C] flex items-center justify-center text-[10px] font-bold text-[#F5F2EC]">
                        {apt.clientName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-[#F5F2EC] block">
                          {apt.clientName}
                        </span>
                        <div className="text-[10px] text-[#B8B8BC]">
                          {hasPhone ? (
                            <span className="tabular-nums">{formatPhone(apt.phone)}</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEditDialog(apt)}
                              className="text-[#F59E0B] hover:underline"
                            >
                              Add phone
                            </button>
                          )}
                        </div>
                        {rescheduledFromApt && (
                          <span className="text-[10px] text-[#B8B8BC] block">
                            Rescheduled from {formatDateLabel(rescheduledFromApt.date, "EEE d MMM")} · {formatTimeLabel(rescheduledFromApt.time)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <StatusDropdown
                        status={apt.status}
                        onStatusChange={(newStatus) =>
                          updateAppointmentStatus(apt.id, newStatus)
                        }
                      />
                      {apt.clientAction === "Rescheduled" && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-transparent border border-[#3A3A3C] text-[#B8B8BC] text-[9px] font-semibold">
                          Rescheduled
                        </span>
                      )}
                      {apt.clientAction === "Cancelled" && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-transparent border border-[#3A3A3C] text-[#B8B8BC] text-[9px] font-semibold">
                          Cancelled
                        </span>
                      )}
                      {isUpcomingActiveBooked && (
                        <StatusBadge status={apt.confirmed} size="xs" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#3A3A3C]/40">
                    <span className="text-[#F5F2EC] font-medium">
                      {formatDateLabel(apt.date)} • {formatTimeLabel(apt.time)}
                    </span>
                    <div className="flex items-center gap-2">
                      {hasPhone && (
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsAppReminder(apt)}
                          className="p-1 rounded-full text-[#25D366]"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded-full text-[#B8B8BC]">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#2A2A2C] border-[#3A3A3C] text-[#F5F2EC]">
                          {isUpcomingActiveBooked && !apt.confirmed && (
                            <DropdownMenuItem
                              onClick={() => confirmAppointment(apt.id)}
                              className="gap-2 text-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                              <span>Mark as confirmed</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleOpenEditDialog(apt)}
                            className="gap-2 text-xs"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#B8B8BC]" />
                            <span>Edit client</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteAppointment(apt.id)}
                            className="gap-2 text-xs text-[#D64545]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#3A3A3C] text-xs text-[#B8B8BC]">
          Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Floating Action Button on Mobile */}
      <div className="md:hidden fixed bottom-6 right-5 z-20">
        <Button
          onClick={() => setAddSheetOpen(true)}
          variant="coral"
          className="rounded-full w-13 h-13 shadow-xl flex items-center justify-center p-0"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* WhatsApp Reminder Modal */}
      <WhatsAppReminderDialog
        appointment={selectedWhatsAppApt}
        open={whatsAppModalOpen}
        onOpenChange={setWhatsAppModalOpen}
      />

      {/* Edit Appointment Dialog */}
      <EditAppointmentDialog
        appointment={selectedEditApt}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Add Appointment Sheet (Drawer) */}
      <AddAppointmentSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
      />
    </div>
  );
}
