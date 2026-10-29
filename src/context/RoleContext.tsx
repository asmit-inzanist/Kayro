"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import {
  Appointment,
  CURRENT_CLIENT_NAME,
  CURRENT_CLIENT_PHONE,
  getAppointments,
  getAppointmentsByPhone,
  confirmAppointment as confirmAppointmentInStore,
  rescheduleAppointment as rescheduleAppointmentInStore,
  cancelAppointment as cancelAppointmentInStore,
  updateStatus as updateStatusInStore,
  bookAppointment as bookAppointmentInStore,
  addAppointmentByAdmin as addAppointmentByAdminInStore,
  resetDemoData as resetDemoDataInStore,
  subscribe,
} from "@/lib/data";

export type Role = "client" | "admin";
export type ClientScreen = "home" | "book" | "appointments" | "reschedule";
export type AdminFilter = "all" | "today" | "upcoming" | "past";

interface Profile {
  name: string;
  role: Role;
  title: string;
  badge: string;
  avatar: string;
  phone: string;
}

export const CLIENT_PROFILE: Profile = {
  name: CURRENT_CLIENT_NAME,
  role: "client",
  title: "Client • Gut & Hormonal Care",
  badge: "Patient Portal",
  avatar: "RS",
  phone: CURRENT_CLIENT_PHONE,
};

export const ADMIN_PROFILE: Profile = {
  name: "Dr. Anika Mehta",
  role: "admin",
  title: "Clinical Nutritionist • M.Sc, RD",
  badge: "Practice Admin",
  avatar: "AM",
  phone: "",
};

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  toggleRole: () => void;
  activeProfile: Profile;
  clientScreen: ClientScreen;
  setClientScreen: (screen: ClientScreen) => void;
  adminFilter: AdminFilter;
  setAdminFilter: (filter: AdminFilter) => void;

  // Single Source of Truth
  appointments: Appointment[];
  clientAppointments: Appointment[];
  upcomingClientAppointments: Appointment[];
  pastClientAppointments: Appointment[];

  activeRescheduleId: string | null;
  setActiveRescheduleId: (id: string | null) => void;
  selectedAppointmentId: string | null;
  setSelectedAppointmentId: (id: string | null) => void;

  // Data Actions
  confirmAppointment: (id: string) => void;
  rescheduleAppointment: (
    id: string,
    newDate: string,
    newTime: string
  ) => { ok: boolean; appointment?: Appointment; reason?: string };
  cancelAppointment: (id: string) => void;
  updateAppointmentStatus: (
    id: string,
    status: "Booked" | "Done" | "No-show"
  ) => void;
  bookAppointment: (params: {
    clientName: string;
    phone: string;
    date: string;
    time: string;
  }) => { ok: boolean; appointment?: Appointment; reason?: string };
  addAppointmentByAdmin: (params: {
    clientName: string;
    phone: string;
    date: string;
    time: string;
  }) => { ok: boolean; appointment?: Appointment; reason?: string };
  resetDemoData: () => void;

  selectedForWhatsApp: Appointment | null;
  setSelectedForWhatsApp: (apt: Appointment | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("client");
  const [clientScreen, setClientScreen] = useState<ClientScreen>("home");
  const [adminFilter, setAdminFilter] = useState<AdminFilter>("all");

  // Synchronized store state
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    getAppointments()
  );

  const [activeRescheduleId, setActiveRescheduleId] = useState<string | null>(
    "apt-1"
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >("apt-1");
  const [selectedForWhatsApp, setSelectedForWhatsApp] =
    useState<Appointment | null>(null);

  // Subscribe to store updates across entire application
  useEffect(() => {
    const sync = () => {
      setAppointments(getAppointments());
    };
    // Sync initially once mounted to pick up localStorage
    sync();
    return subscribe(sync);
  }, []);

  const activeProfile = role === "client" ? CLIENT_PROFILE : ADMIN_PROFILE;

  const toggleRole = () => {
    setRole((prev) => (prev === "client" ? "admin" : "client"));
  };

  // Derived client appointments for current client (Riya Shah, 9820011111)
  const clientAppointments = useMemo(() => {
    return getAppointmentsByPhone(CURRENT_CLIENT_PHONE);
  }, [appointments]);

  const upcomingClientAppointments = useMemo(() => {
    return clientAppointments.filter(
      (apt) => apt.status === "Booked" && apt.clientAction === "none"
    );
  }, [clientAppointments]);

  const pastClientAppointments = useMemo(() => {
    return clientAppointments.filter(
      (apt) =>
        (apt.status === "Done" || apt.status === "No-show") &&
        apt.clientAction === "none"
    );
  }, [clientAppointments]);

  // Keep selectedAppointmentId valid if deleted/cancelled
  useEffect(() => {
    if (
      selectedAppointmentId &&
      !appointments.some((a) => a.id === selectedAppointmentId)
    ) {
      setSelectedAppointmentId(upcomingClientAppointments[0]?.id || null);
    }
  }, [appointments, selectedAppointmentId, upcomingClientAppointments]);

  const confirmAppointment = (id: string) => {
    confirmAppointmentInStore(id);
  };

  const rescheduleAppointment = (
    id: string,
    newDate: string,
    newTime: string
  ) => {
    const result = rescheduleAppointmentInStore(id, newDate, newTime);
    if (result.ok && result.appointment) {
      setSelectedAppointmentId(result.appointment.id);
      setClientScreen("appointments");
    }
    return result;
  };

  const cancelAppointment = (id: string) => {
    cancelAppointmentInStore(id);
  };

  const updateAppointmentStatus = (
    id: string,
    status: "Booked" | "Done" | "No-show"
  ) => {
    updateStatusInStore(id, status);
  };

  const bookAppointment = (params: {
    clientName: string;
    phone: string;
    date: string;
    time: string;
  }) => {
    return bookAppointmentInStore(params);
  };

  const addAppointmentByAdmin = (params: {
    clientName: string;
    phone: string;
    date: string;
    time: string;
  }) => {
    return addAppointmentByAdminInStore(params);
  };

  const resetDemoData = () => {
    resetDemoDataInStore();
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        activeProfile,
        clientScreen,
        setClientScreen,
        adminFilter,
        setAdminFilter,
        appointments,
        clientAppointments,
        upcomingClientAppointments,
        pastClientAppointments,
        activeRescheduleId,
        setActiveRescheduleId,
        selectedAppointmentId,
        setSelectedAppointmentId,
        confirmAppointment,
        rescheduleAppointment,
        cancelAppointment,
        updateAppointmentStatus,
        bookAppointment,
        addAppointmentByAdmin,
        resetDemoData,
        selectedForWhatsApp,
        setSelectedForWhatsApp,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
