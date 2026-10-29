"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { ClientApp } from "@/components/ClientApp";
import { AdminApp } from "@/components/AdminApp";
import {
  Home,
  Calendar,
  Clock,
  ArrowRightLeft,
  LayoutDashboard,
  CalendarDays,
  User,
} from "lucide-react";
import { cn, formatPhone, isPastAppointment } from "@/lib/utils";
import { getTodayStr } from "@/lib/data";
import {
  ClientSwitcherPopover,
  ClientSwitcherSheet,
} from "@/components/ClientSwitcher";

export function AppShell() {
  const [mobileSwitcherOpen, setMobileSwitcherOpen] = useState(false);
  const {
    role,
    setRole,
    clientScreen,
    setClientScreen,
    adminFilter,
    setAdminFilter,
    appointments,
    upcomingClientAppointments,
    deviceIdentity,
    resetDemoData,
  } = useRole();

  // ── Exact brand tokens ──────────────────────────────────────────────────
  const CANVAS   = "#1C1C1E";   // page background
  const SIDEBAR  = "#141416";   // sidebar surface
  const SURFACE  = "#2A2A2C";   // cards / hover bg
  const BORDER   = "#3A3A3C";   // card borders
  const CORAL    = "#F4694C";   // active nav, CTAs
  const TEXT1    = "#F5F2EC";   // primary text
  const TEXT2    = "#B8B8BC";   // secondary text
  const ONLINE   = "#34D399";   // green online dot

  return (
    <div className="min-h-screen text-[#F5F2EC] flex flex-col lg:flex-row font-sans" style={{ backgroundColor: CANVAS }}>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP SIDEBAR (lg+)
      ═══════════════════════════════════════════════════════════ */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[240px] flex-col justify-between p-6 z-30 select-none"
        style={{ backgroundColor: SIDEBAR, borderRight: `1px solid ${BORDER}` }}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#1E3D2C", border: `1px solid #2B5040` }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" /><path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" /><path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight block leading-none" style={{ color: TEXT1 }}>
                Nourish
              </span>
              <span className="text-[9px] font-semibold tracking-[0.16em] uppercase block mt-1" style={{ color: TEXT2 }}>
                {role === "client" ? "CONSULTATION WEB" : "PRACTICE"}
              </span>
            </div>
          </div>

          {/* Nav items */}
          <div className="mt-8 space-y-1.5">
            {role === "client" ? (
              <>
                {[
                  { screen: "home",         label: "Home",             Icon: Home },
                  { screen: "book",         label: "Book Consultation", Icon: Calendar },
                  {
                    screen: "appointments",
                    label: "Appointments",
                    Icon: Clock,
                    badge: upcomingClientAppointments.length,
                  },
                ].map(({ screen, label, Icon, badge }) => {
                  const active = clientScreen === screen || (screen === "appointments" && clientScreen === "reschedule");
                  return (
                    <button
                      key={screen}
                      type="button"
                      onClick={() => setClientScreen(screen as Parameters<typeof setClientScreen>[0])}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer"
                      style={{
                        backgroundColor: active ? CORAL : "transparent",
                        color: active ? "#fff" : TEXT2,
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = SURFACE; }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{label}</span>
                      </div>
                      {Boolean(badge) && (
                        <span className="w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center"
                          style={{ backgroundColor: active ? "rgba(255,255,255,0.2)" : SURFACE, color: TEXT1 }}>
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                {[
                  {
                    filter: "all",
                    label: "All Consultations",
                    Icon: LayoutDashboard,
                    badge: appointments.filter((a) => a.clientAction === "none").length,
                  },
                  {
                    filter: "today",
                    label: "Today's Schedule",
                    Icon: CalendarDays,
                    badge: appointments.filter(
                      (a) => a.date === getTodayStr() && a.status === "Booked" && a.clientAction === "none" && !isPastAppointment(a)
                    ).length,
                  },
                  {
                    filter: "upcoming",
                    label: "Upcoming Queue",
                    Icon: Clock,
                    badge: appointments.filter(
                      (a) => a.status === "Booked" && a.clientAction === "none" && !isPastAppointment(a)
                    ).length,
                  },
                ].map(({ filter, label, Icon, badge }) => {
                  const active = adminFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setAdminFilter(filter as Parameters<typeof setAdminFilter>[0])}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer"
                      style={{
                        backgroundColor: active ? CORAL : "transparent",
                        color: active ? "#fff" : TEXT2,
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = SURFACE; }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{label}</span>
                      </div>
                      {badge !== undefined && (
                        <span className="w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center"
                          style={{ backgroundColor: active ? "rgba(255,255,255,0.2)" : SURFACE, color: TEXT1 }}>
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* ── Profile / Role Switcher ── */}
        <div className="mt-auto pt-5" style={{ borderTop: `1px solid ${BORDER}` }}>
          {role === "client" ? (
            <ClientSwitcherPopover>
              <button
                type="button"
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl transition-colors cursor-pointer"
                style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = CORAL)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}
              >
                {/* Avatar */}
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: `1.5px solid ${BORDER}` }}>
                  {deviceIdentity.name === "Riya Shah" ? (
                    <div className="w-full h-full bg-[#7C3AED] flex items-center justify-center p-1">
                      <img
                        src="/people_17742292.png"
                        alt={deviceIdentity.name}
                        className="w-full h-full object-contain brightness-0 invert"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-[#F4694C]">
                      {deviceIdentity.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  {/* Online dot */}
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#141416]"
                    style={{ backgroundColor: ONLINE }}
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-sm font-semibold truncate block" style={{ color: TEXT1 }}>
                    {deviceIdentity.name}
                  </span>
                  <span className="text-[10px] truncate block" style={{ color: TEXT2 }}>
                    {formatPhone(deviceIdentity.phone)}
                  </span>
                </div>
              </button>
            </ClientSwitcherPopover>
          ) : (
            <button
              type="button"
              onClick={() => setRole("client")}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl transition-colors cursor-pointer"
              style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = CORAL)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}
            >
              {/* Avatar */}
              <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: `1.5px solid ${BORDER}` }}>
                <div className="w-full h-full flex items-center justify-center text-white" style={{ backgroundColor: "#365744" }}>
                  <User className="w-4 h-4 text-white" />
                </div>
                {/* Online dot */}
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#141416]"
                  style={{ backgroundColor: ONLINE }}
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-sm font-semibold truncate block" style={{ color: TEXT1 }}>
                  Dr. Kayro
                </span>
                <span className="text-[10px] truncate block" style={{ color: TEXT2 }}>
                  Practice Owner
                </span>
              </div>
            </button>
          )}

          {role === "client" ? (
            <button
              type="button"
              onClick={() => resetDemoData()}
              className="w-full text-center text-[11px] transition-colors cursor-pointer mt-2 block"
              style={{ color: TEXT2 }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT1)}
              onMouseLeave={e => (e.currentTarget.style.color = TEXT2)}
            >
              Reset demo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setRole("client")}
              className="w-full text-center text-[11px] transition-colors cursor-pointer mt-2 block"
              style={{ color: TEXT2 }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT1)}
              onMouseLeave={e => (e.currentTarget.style.color = TEXT2)}
            >
              Switch to Client view
            </button>
          )}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE TOP BAR (< lg)
      ═══════════════════════════════════════════════════════════ */}
      <header
        className="lg:hidden sticky top-0 z-40 px-4 py-3 flex items-center justify-between backdrop-blur-md"
        style={{ backgroundColor: `${SIDEBAR}F2`, borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#1E3D2C", border: `1px solid #2B5040` }}>
            <span className="font-serif font-bold text-xs" style={{ color: ONLINE }}>N</span>
          </div>
          <div>
            <span className="font-serif text-base font-bold" style={{ color: TEXT1 }}>Nourish</span>
            <span className="text-[9px] font-semibold ml-2 tracking-wider uppercase" style={{ color: TEXT2 }}>
              {role === "client" ? "CONSULTATION" : "ADMIN"}
            </span>
          </div>
        </div>

        {/* Mobile role switch pill */}
        <button
          onClick={() => {
            if (role === "client") {
              setMobileSwitcherOpen(true);
            } else {
              setRole("client");
            }
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
          style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, color: TEXT1 }}
        >
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: CORAL }}>
            {role === "client" ? (deviceIdentity.name[0] || "R") : "K"}
          </div>
          <span>{role === "client" ? (deviceIdentity.name.split(" ")[0] || "Client") : "Dr. Kayro"}</span>
          <ArrowRightLeft className="w-3 h-3" style={{ color: TEXT2 }} />
        </button>
      </header>

      {/* Mobile Client Switcher Sheet */}
      <ClientSwitcherSheet
        open={mobileSwitcherOpen}
        onOpenChange={setMobileSwitcherOpen}
      />

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════════════════════════ */}
      <main
        className="lg:ml-[240px] flex-1 min-h-screen px-4 sm:px-6 lg:px-10 pt-3.5 lg:pt-4 pb-24 lg:pb-12 overflow-x-hidden"
        style={{ backgroundColor: CANVAS }}
      >
        {role === "client" ? <ClientApp /> : <AdminApp />}
      </main>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE BOTTOM TAB BAR (< lg)
      ═══════════════════════════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-4 left-4 right-4 z-40 p-2 shadow-2xl flex items-center justify-around rounded-full backdrop-blur-xl border border-[#3A3A3C]"
        style={{ backgroundColor: "#18181AE8" }}
      >
        {role === "client" ? (
          <>
            {[
              { screen: "home",         label: "Home",     Icon: Home },
              { screen: "book",         label: "Book",     Icon: Calendar },
              { screen: "appointments", label: "Sessions", Icon: User },
            ].map(({ screen, label, Icon }) => {
              const active = clientScreen === screen || (screen === "appointments" && clientScreen === "reschedule");

              if (screen === "book" && active) {
                return (
                  <button
                    key={screen}
                    type="button"
                    onClick={() => setClientScreen("book")}
                    className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#F4694C] shadow-lg shadow-[#F4694C]/45 flex items-center justify-center text-white -mt-2">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-[#F4694C]">{label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={screen}
                  type="button"
                  onClick={() => setClientScreen(screen as Parameters<typeof setClientScreen>[0])}
                  className="flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium cursor-pointer"
                  style={{
                    color: active ? CORAL : "#6E6E73",
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px]">{label}</span>
                </button>
              );
            })}
          </>
        ) : (
          <>
            {[
              { filter: "all",      label: "Schedule", Icon: LayoutDashboard },
              { filter: "today",    label: "Today",    Icon: CalendarDays },
              { filter: "upcoming", label: "Upcoming", Icon: Clock },
            ].map(({ filter, label, Icon }) => {
              const active = adminFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setAdminFilter(filter as Parameters<typeof setAdminFilter>[0])}
                  className="flex-1 py-2 rounded-full flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium"
                  style={{
                    backgroundColor: active ? CORAL : "transparent",
                    color: active ? "#fff" : TEXT2,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px]">{label}</span>
                </button>
              );
            })}
          </>
        )}
      </nav>
    </div>
  );
}
