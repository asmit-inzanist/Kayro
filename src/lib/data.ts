/**
 * SINGLE SOURCE OF TRUTH FOR NOURISH APPOINTMENTS
 * All data access is encapsulated behind these functions.
 */

export interface Appointment {
  id: string;
  clientName: string;
  phone: string; // stored as 10 digits only e.g. "9820011111", or ""
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm" in 24h, e.g. "16:30"
  status: "Booked" | "Done" | "No-show";
  confirmed: boolean;
  clientAction: "none" | "Cancelled" | "Rescheduled";
  createdAt?: string;
}

/**
 * DEMO CLOCK
 * Exported constant: DEMO_NOW = 2026-10-28 11:00 IST
 * In JavaScript Date, month index 9 is October (0-indexed).
 * Today is Wednesday, 28 Oct 2026.
 */
export const DEMO_NOW = new Date(2026, 9, 28, 11, 0, 0);
export const DEMO_TODAY_STR = "2026-10-28";
export const DEMO_TOMORROW_STR = "2026-10-29";

/**
 * CLIENT IDENTITY
 * Phone is the primary identifier.
 */
export const CURRENT_CLIENT_PHONE = "9820011111";
export const CURRENT_CLIENT_NAME = "Riya Shah";

/**
 * FIXED SLOT GRID
 * Every 30 minutes from 09:00 to 17:30 (18 slots).
 */
export const FIXED_SLOTS_24H: string[] = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

/**
 * SEED DATA (Exactly these 7 rows, nothing else)
 */
export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    clientName: "Riya Shah",
    phone: "9820011111",
    date: "2026-10-29",
    time: "10:00",
    status: "Booked",
    confirmed: false,
    clientAction: "none",
    createdAt: "2026-10-20T10:00:00Z",
  },
  {
    id: "apt-2",
    clientName: "Riya Shah",
    phone: "9820011111",
    date: "2026-11-14",
    time: "16:30",
    status: "Booked",
    confirmed: false,
    clientAction: "none",
    createdAt: "2026-10-21T10:00:00Z",
  },
  {
    id: "apt-3",
    clientName: "Riya Shah",
    phone: "9820011111",
    date: "2026-10-25",
    time: "16:00",
    status: "Done",
    confirmed: true,
    clientAction: "none",
    createdAt: "2026-10-15T10:00:00Z",
  },
  {
    id: "apt-4",
    clientName: "Riya Shah",
    phone: "9820011111",
    date: "2026-10-24",
    time: "10:00",
    status: "Done",
    confirmed: true,
    clientAction: "none",
    createdAt: "2026-10-14T10:00:00Z",
  },
  {
    id: "apt-5",
    clientName: "Arjun Mehta",
    phone: "9820022222",
    date: "2026-10-24",
    time: "11:30",
    status: "Done",
    confirmed: true,
    clientAction: "none",
    createdAt: "2026-10-14T11:00:00Z",
  },
  {
    id: "apt-6",
    clientName: "Meera Iyer",
    phone: "",
    date: "2026-10-23",
    time: "09:00",
    status: "Done",
    confirmed: true,
    clientAction: "none",
    createdAt: "2026-10-13T09:00:00Z",
  },
  {
    id: "apt-7",
    clientName: "Kabir Rao",
    phone: "9820033333",
    date: "2026-10-22",
    time: "14:00",
    status: "No-show",
    confirmed: true,
    clientAction: "none",
    createdAt: "2026-10-12T14:00:00Z",
  },
];

const STORAGE_KEY = "nourish_appointments_store";

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Error in appointment store subscriber:", e);
    }
  });
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function normalizePhoneDigits(raw: string | undefined): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
}

function loadInitialStore(): Appointment[] {
  if (typeof window === "undefined") {
    return [...SEED_APPOINTMENTS];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load appointments from localStorage:", e);
  }
  return [...SEED_APPOINTMENTS];
}

let store: Appointment[] = loadInitialStore();

function persistStore(newData: Appointment[]) {
  store = newData;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error("Failed to persist appointments to localStorage:", e);
    }
  }
  notifyListeners();
}

// ─────────────────────────────────────────────────────────────
// DATA FUNCTIONS (Single API for both Client and Admin)
// ─────────────────────────────────────────────────────────────

export function getAppointments(): Appointment[] {
  return [...store];
}

export function getAppointmentsByPhone(phone: string): Appointment[] {
  const target = normalizePhoneDigits(phone);
  if (!target) return [];
  return store.filter(
    (apt) => normalizePhoneDigits(apt.phone) === target
  );
}

/**
 * Returns all 18 fixed slots for a given date ("YYYY-MM-DD")
 * with { time: "HH:mm", available: boolean }.
 * Taken slots and slots earlier than DEMO_NOW on today's date are available = false.
 */
export function getSlotsForDate(
  date: string,
  excludeAppointmentId?: string
): { time: string; available: boolean }[] {
  // Check date against DEMO_TODAY_STR ("2026-10-28")
  const isToday = date === DEMO_TODAY_STR;
  const isPastDate = date < DEMO_TODAY_STR;

  return FIXED_SLOTS_24H.map((slotTime) => {
    // 1. If date is prior to DEMO_NOW date -> completely unavailable
    if (isPastDate) {
      return { time: slotTime, available: false };
    }

    // 2. If date is today, slots earlier than 11:00 are disabled
    if (isToday) {
      const [slotH, slotM] = slotTime.split(":").map(Number);
      const slotMinutes = slotH * 60 + slotM;
      const demoNowMinutes = DEMO_NOW.getHours() * 60 + DEMO_NOW.getMinutes(); // 11 * 60 + 0 = 660
      if (slotMinutes <= demoNowMinutes) {
        return { time: slotTime, available: false };
      }
    }

    // 3. Check if slot is taken by an active Booked appointment
    const isTaken = store.some((apt) => {
      if (excludeAppointmentId && apt.id === excludeAppointmentId) {
        return false;
      }
      return (
        apt.date === date &&
        apt.time === slotTime &&
        apt.status === "Booked" &&
        apt.clientAction === "none"
      );
    });

    return {
      time: slotTime,
      available: !isTaken,
    };
  });
}

/**
 * Books a new appointment after re-checking slot availability.
 */
export function bookAppointment({
  clientName,
  phone,
  date,
  time,
}: {
  clientName: string;
  phone: string;
  date: string;
  time: string;
}): { ok: boolean; appointment?: Appointment; reason?: string } {
  // 1. Re-check slot availability
  const slots = getSlotsForDate(date);
  const targetSlot = slots.find((s) => s.time === time);

  if (!targetSlot || !targetSlot.available) {
    return { ok: false, reason: "slot_taken" };
  }

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    clientName: clientName.trim(),
    phone: normalizePhoneDigits(phone),
    date,
    time,
    status: "Booked",
    confirmed: false,
    clientAction: "none",
    createdAt: new Date().toISOString(),
  };

  persistStore([newAppointment, ...store]);
  return { ok: true, appointment: newAppointment };
}

/**
 * Reschedules an appointment:
 * 1. Checks new slot availability first (not offering what client already holds).
 * 2. Creates a NEW row for the new slot.
 * 3. Marks old row clientAction = "Rescheduled".
 * 4. Releases the old slot only after the new one succeeds.
 */
export function rescheduleAppointment(
  id: string,
  newDate: string,
  newTime: string
): { ok: boolean; appointment?: Appointment; reason?: string } {
  const oldAppointment = store.find((apt) => apt.id === id);
  if (!oldAppointment) {
    return { ok: false, reason: "not_found" };
  }

  // Do not allow rebooking the exact slot held
  if (oldAppointment.date === newDate && oldAppointment.time === newTime) {
    return { ok: false, reason: "same_slot" };
  }

  // Check new slot availability (ignoring the current appointment)
  const slots = getSlotsForDate(newDate, id);
  const targetSlot = slots.find((s) => s.time === newTime);

  if (!targetSlot || !targetSlot.available) {
    return { ok: false, reason: "slot_taken" };
  }

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    clientName: oldAppointment.clientName,
    phone: oldAppointment.phone,
    date: newDate,
    time: newTime,
    status: "Booked",
    confirmed: true, // confirmed when rescheduled
    clientAction: "none",
    createdAt: new Date().toISOString(),
  };

  // Mark old appointment as Rescheduled
  const updatedStore = store.map((apt) =>
    apt.id === id ? { ...apt, clientAction: "Rescheduled" as const } : apt
  );

  persistStore([newAppointment, ...updatedStore]);
  return { ok: true, appointment: newAppointment };
}

/**
 * Cancels an appointment. The slot becomes free again.
 */
export function cancelAppointment(id: string): void {
  const updatedStore = store.map((apt) =>
    apt.id === id ? { ...apt, clientAction: "Cancelled" as const } : apt
  );
  persistStore(updatedStore);
}

/**
 * Confirms an appointment (sets confirmed = true).
 */
export function confirmAppointment(id: string): void {
  const updatedStore = store.map((apt) =>
    apt.id === id ? { ...apt, confirmed: true } : apt
  );
  persistStore(updatedStore);
}

/**
 * Updates status (Booked | Done | No-show).
 */
export function updateStatus(
  id: string,
  status: "Booked" | "Done" | "No-show"
): void {
  const updatedStore = store.map((apt) =>
    apt.id === id ? { ...apt, status } : apt
  );
  persistStore(updatedStore);
}

/**
 * Adds an appointment via Admin management drawer.
 */
export function addAppointmentByAdmin({
  clientName,
  phone,
  date,
  time,
}: {
  clientName: string;
  phone: string;
  date: string;
  time: string;
}): { ok: boolean; appointment?: Appointment; reason?: string } {
  return bookAppointment({ clientName, phone, date, time });
}

/**
 * Restores demo seed data.
 */
export function resetDemoData(): void {
  persistStore([...SEED_APPOINTMENTS]);
}
