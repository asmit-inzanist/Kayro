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
  KnownClient,
  getKnownClients,
  getNow,
  CURRENT_CLIENT_NAME,
  CURRENT_CLIENT_PHONE,
  normalizePhoneDigits,
  confirmAppointment as confirmAppointmentInStore,
  rescheduleAppointment as rescheduleAppointmentInStore,
  cancelAppointment as cancelAppointmentInStore,
  updateStatus as updateStatusInStore,
  bookAppointment as bookAppointmentInStore,
  addAppointmentByAdmin as addAppointmentByAdminInStore,
  updateAppointment as updateAppointmentInStore,
  deleteAppointment as deleteAppointmentInStore,
  resetDemoData as resetDemoDataInStore,
} from "@/lib/data";
import { getAppointmentDateTime, isPastAppointment } from "@/lib/utils";
import { useAppointments } from "@/hooks/useAppointments";

export type Role = "client" | "admin";
export type ClientScreen = "home" | "book" | "appointments" | "reschedule";
export type AdminFilter = "all" | "today" | "upcoming" | "past";

export interface DeviceIdentity {
  name: string;
  phone: string;
}

const DEFAULT_DEVICE_IDENTITY: DeviceIdentity = {
  name: CURRENT_CLIENT_NAME, // "Riya Shah"
  phone: CURRENT_CLIENT_PHONE, // "9820011111"
};

const DEVICE_IDENTITY_STORAGE_KEY = "nourish_device_identity";

interface Profile {
  name: string;
  role: Role;
  title: string;
  badge: string;
  avatar: string;
  phone: string;
}

export const ADMIN_PROFILE: Profile = {
  name: "Dr. Kayro",
  role: "admin",
  title: "Clinical Nutritionist • M.Sc, RD",
  badge: "Practice Admin",
  avatar: "DK",
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

  // Device Identity
  deviceIdentity: DeviceIdentity;
  setDeviceIdentity: (identity: DeviceIdentity) => void;
  resetDeviceIdentity: () => void;

  // Single Source of Truth
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  clientAppointments: Appointment[];
  upcomingClientAppointments: Appointment[];
  pastClientAppointments: Appointment[];
  knownClients: KnownClient[];

  activeRescheduleId: string | null;
  setActiveRescheduleId: (id: string | null) => void;
  selectedAppointmentId: string | null;
  setSelectedAppointmentId: (id: string | null) => void;

  // Data Actions
  confirmAppointment: (id: string) => Promise<void>;
  rescheduleAppointment: (
    id: string,
    newDate: string,
    newTime: string
  ) => Promise<{ ok: boolean; appointment?: Appointment; reason?: string }>;
  cancelAppointment: (id: string) => Promise<void>;
  updateAppointmentStatus: (
    id: string,
    status: "Booked" | "Done" | "No-show"
  ) => Promise<void>;
  bookAppointment: (params: {
    clientName: string;
    phone: string;
    date: string;
    time: string;
  }) => Promise<{ ok: boolean; appointment?: Appointment; reason?: string }>;
  addAppointmentByAdmin: (params: {
    clientName: string;
    phone: string;
    date: string;
    time: string;
  }) => Promise<{ ok: boolean; appointment?: Appointment; reason?: string }>;
  updateAppointment: (
    id: string,
    patch: { clientName?: string; phone?: string }
  ) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  resetDemoData: () => Promise<void>;

  selectedForWhatsApp: Appointment | null;
  setSelectedForWhatsApp: (apt: Appointment | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("client");
  const [clientScreen, setClientScreen] = useState<ClientScreen>("home");
  const [adminFilter, setAdminFilter] = useState<AdminFilter>("all");

  // Device identity persisted in localStorage (defaults to Riya Shah, 9820011111)
  const [deviceIdentity, setDeviceIdentityState] = useState<DeviceIdentity>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(DEVICE_IDENTITY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name && parsed?.phone) {
            return {
              name: String(parsed.name).trim(),
              phone: normalizePhoneDigits(String(parsed.phone)),
            };
          }
        }
      } catch (e) {
        console.error("Failed to load device identity:", e);
      }
    }
    return DEFAULT_DEVICE_IDENTITY;
  });

  const setDeviceIdentity = (identity: DeviceIdentity) => {
    const clean = {
      name: identity.name.trim(),
      phone: normalizePhoneDigits(identity.phone),
    };
    setDeviceIdentityState(clean);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DEVICE_IDENTITY_STORAGE_KEY, JSON.stringify(clean));
      } catch (e) {
        console.error("Failed to save device identity:", e);
      }
    }
  };

  const resetDeviceIdentity = () => {
    setDeviceIdentityState(DEFAULT_DEVICE_IDENTITY);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(DEVICE_IDENTITY_STORAGE_KEY);
      } catch (e) {
        console.error("Failed to remove device identity from localStorage:", e);
      }
    }
  };

  // Supabase data source via custom hook
  const { appointments, loading, error, refetch } = useAppointments();

  const [activeRescheduleId, setActiveRescheduleId] = useState<string | null>(
    "apt-1"
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >("apt-1");
  const [selectedForWhatsApp, setSelectedForWhatsApp] =
    useState<Appointment | null>(null);

  const activeProfile: Profile = useMemo(() => {
    if (role === "admin") {
      return ADMIN_PROFILE;
    }
    const initials = deviceIdentity.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RS";

    return {
      name: deviceIdentity.name,
      role: "client",
      title: "Client • Gut & Hormonal Care",
      badge: "Patient Portal",
      avatar: initials,
      phone: deviceIdentity.phone,
    };
  }, [role, deviceIdentity]);

  const toggleRole = () => {
    setRole((prev) => (prev === "client" ? "admin" : "client"));
  };

  // Derived appointments for current device identity
  const clientAppointments = useMemo(() => {
    const target = normalizePhoneDigits(deviceIdentity.phone);
    if (!target) return [];
    return appointments.filter(
      (apt) => normalizePhoneDigits(apt.phone) === target
    );
  }, [appointments, deviceIdentity.phone]);

  const upcomingClientAppointments = useMemo(() => {
    return clientAppointments
      .filter(
        (apt) =>
          apt.status === "Booked" &&
          apt.clientAction === "none" &&
          !isPastAppointment(apt)
      )
      .sort((a, b) => getAppointmentDateTime(a).getTime() - getAppointmentDateTime(b).getTime());
  }, [clientAppointments]);

  const pastClientAppointments = useMemo(() => {
    return clientAppointments
      .filter(
        (apt) =>
          apt.status === "Done" ||
          apt.status === "No-show" ||
          apt.clientAction === "Cancelled" ||
          apt.clientAction === "Rescheduled" ||
          (apt.status === "Booked" && isPastAppointment(apt))
      )
      .sort((a, b) => getAppointmentDateTime(b).getTime() - getAppointmentDateTime(a).getTime());
  }, [clientAppointments]);

  // Grouped known clients for client switcher
  const knownClients = useMemo(() => {
    const list = getKnownClients(appointments);
    // If the current identity has no bookings yet, still show it at the top of the client list.
    const currentNorm = normalizePhoneDigits(deviceIdentity.phone);
    if (currentNorm && !list.some((c) => c.phone === currentNorm)) {
      return [
        {
          phone: currentNorm,
          name: deviceIdentity.name,
          lastBookedAt: getNow().toISOString(),
        },
        ...list,
      ];
    }
    return list;
  }, [appointments, deviceIdentity]);

  // Keep selectedAppointmentId valid if deleted/cancelled
  useEffect(() => {
    if (
      selectedAppointmentId &&
      !appointments.some((a) => a.id === selectedAppointmentId)
    ) {
      setSelectedAppointmentId(upcomingClientAppointments[0]?.id || null);
    }
  }, [appointments, selectedAppointmentId, upcomingClientAppointments]);

  const confirmAppointment = async (id: string) => {
    await confirmAppointmentInStore(id);
    await refetch();
  };

  const rescheduleAppointment = async (
    id: string,
    newDate: string,
    newTime: string
  ) => {
    const result = await rescheduleAppointmentInStore(id, newDate, newTime);
    if (result.ok && result.appointment) {
      setSelectedAppointmentId(result.appointment.id);
      setClientScreen("appointments");
      await refetch();
    }
    return result;
  };

  const cancelAppointment = async (id: string) => {
    await cancelAppointmentInStore(id);
    await refetch();
  };

  const updateAppointmentStatus = async (
    id: string,
    status: "Booked" | "Done" | "No-show"
  ) => {
    await updateStatusInStore(id, status);
    await refetch();
  };

  const bookAppointment = async (params: {
    clientName: string;
    phone: string;
    date: string;
    time: string;
  }) => {
    const result = await bookAppointmentInStore(params);
    if (result.ok) {
      await refetch();
    }
    return result;
  };

  const addAppointmentByAdmin = async (params: {
    clientName: string;
    phone: string;
    date: string;
    time: string;
  }) => {
    const result = await addAppointmentByAdminInStore(params);
    if (result.ok) {
      await refetch();
    }
    return result;
  };

  const updateAppointment = async (
    id: string,
    patch: { clientName?: string; phone?: string }
  ) => {
    await updateAppointmentInStore(id, patch);
    await refetch();
  };

  const deleteAppointment = async (id: string) => {
    await deleteAppointmentInStore(id);
    await refetch();
  };

  const resetDemoData = async () => {
    resetDeviceIdentity();
    await resetDemoDataInStore();
    await refetch();
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
        deviceIdentity,
        setDeviceIdentity,
        resetDeviceIdentity,
        appointments,
        loading,
        error,
        refetch,
        clientAppointments,
        upcomingClientAppointments,
        pastClientAppointments,
        knownClients,
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
        updateAppointment,
        deleteAppointment,
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
