/**
 * SINGLE SOURCE OF TRUTH FOR NOURISH APPOINTMENTS (SUPABASE CLIENT)
 * All data access is encapsulated behind these functions.
 */

import { supabase } from "./supabase";
import { format, addDays } from "date-fns";

export interface Appointment {
  id: string;
  clientName: string;
  phone: string; // stored as 10 digits only e.g. "9820011111", or ""
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm" in 24h, e.g. "16:30"
  status: "Booked" | "Done" | "No-show";
  confirmed: boolean;
  clientAction: "none" | "Cancelled" | "Rescheduled";
  rescheduledFrom?: string | null;
  createdAt?: string;
}

export interface KnownClient {
  phone: string;
  name: string;
  lastBookedAt: string;
}

export interface AppointmentDbRow {
  id: string;
  client_name: string;
  phone: string | null;
  date: string;
  time: string;
  status: "Booked" | "Done" | "No-show";
  confirmed: boolean;
  client_action: "none" | "Cancelled" | "Rescheduled";
  rescheduled_from?: string | null;
  created_at?: string;
}

export function mapRowToAppointment(row: AppointmentDbRow): Appointment {
  return {
    id: row.id,
    clientName: row.client_name,
    phone: row.phone || "",
    date: typeof row.date === "string" ? row.date.slice(0, 10) : String(row.date),
    time: row.time,
    status: row.status,
    confirmed: Boolean(row.confirmed),
    clientAction: row.client_action,
    rescheduledFrom: row.rescheduled_from || null,
    createdAt: row.created_at,
  };
}

/**
 * CLOCK
 * Single source of truth for the current time in IST.
 */
export function getNow(): Date {
  if (typeof window === "undefined") {
    return new Date(2026, 9, 29, 12, 0, 0);
  }
  return new Date();
}

export function getTodayStr(): string {
  return format(getNow(), "yyyy-MM-dd");
}

export function getTomorrowStr(): string {
  return format(addDays(getNow(), 1), "yyyy-MM-dd");
}

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
 * SEED DATA (Reference copy, relative to current date)
 */
export function getSeedAppointments(): Appointment[] {
  const now = getNow();
  return [
    {
      id: "apt-1",
      clientName: "Riya Shah",
      phone: "9820011111",
      date: format(addDays(now, 1), "yyyy-MM-dd"),
      time: "10:00",
      status: "Booked",
      confirmed: false,
      clientAction: "none",
      createdAt: format(addDays(now, -9), "yyyy-MM-dd'T'10:00:00'Z'"),
    },
    {
      id: "apt-2",
      clientName: "Riya Shah",
      phone: "9820011111",
      date: format(addDays(now, 17), "yyyy-MM-dd"),
      time: "16:30",
      status: "Booked",
      confirmed: false,
      clientAction: "none",
      createdAt: format(addDays(now, -8), "yyyy-MM-dd'T'10:00:00'Z'"),
    },
    {
      id: "apt-3",
      clientName: "Riya Shah",
      phone: "9820011111",
      date: format(addDays(now, -3), "yyyy-MM-dd"),
      time: "16:00",
      status: "Done",
      confirmed: true,
      clientAction: "none",
      createdAt: format(addDays(now, -14), "yyyy-MM-dd'T'10:00:00'Z'"),
    },
    {
      id: "apt-4",
      clientName: "Riya Shah",
      phone: "9820011111",
      date: format(addDays(now, -4), "yyyy-MM-dd"),
      time: "10:00",
      status: "Done",
      confirmed: true,
      clientAction: "none",
      createdAt: format(addDays(now, -15), "yyyy-MM-dd'T'10:00:00'Z'"),
    },
    {
      id: "apt-5",
      clientName: "Arjun Mehta",
      phone: "9820022222",
      date: format(addDays(now, -4), "yyyy-MM-dd"),
      time: "11:30",
      status: "Done",
      confirmed: true,
      clientAction: "none",
      createdAt: format(addDays(now, -15), "yyyy-MM-dd'T'11:00:00'Z'"),
    },
    {
      id: "apt-6",
      clientName: "Meera Iyer",
      phone: "",
      date: format(addDays(now, -5), "yyyy-MM-dd"),
      time: "09:00",
      status: "Done",
      confirmed: true,
      clientAction: "none",
      createdAt: format(addDays(now, -16), "yyyy-MM-dd'T'09:00:00'Z'"),
    },
    {
      id: "apt-7",
      clientName: "Kabir Rao",
      phone: "9820033333",
      date: format(addDays(now, -6), "yyyy-MM-dd"),
      time: "14:00",
      status: "No-show",
      confirmed: true,
      clientAction: "none",
      createdAt: format(addDays(now, -17), "yyyy-MM-dd'T'14:00:00'Z'"),
    },
  ];
}

export const SEED_APPOINTMENTS: Appointment[] = getSeedAppointments();

export function normalizePhoneDigits(raw: string | undefined): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
}

export function subscribe(listener: () => void): () => void {
  // Maintained for backward compatibility; Realtime updates are managed in useAppointments hook
  return () => {};
}

// ─────────────────────────────────────────────────────────────
// DATA FUNCTIONS (Async API backed by Supabase)
// ─────────────────────────────────────────────────────────────

export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }

  return (data || []).map(mapRowToAppointment);
}

function parseKnownClients(appointmentsList: Appointment[]): KnownClient[] {
  const map = new Map<
    string,
    { phone: string; name: string; lastBookedAt: string; sortTime: number }
  >();

  for (const apt of appointmentsList) {
    const norm = normalizePhoneDigits(apt.phone);
    if (!norm) continue;

    const createdStr = apt.createdAt || `${apt.date}T${apt.time}:00Z`;
    const sortTime = new Date(createdStr).getTime();

    const existing = map.get(norm);
    if (!existing || sortTime > existing.sortTime) {
      map.set(norm, {
        phone: norm,
        name: apt.clientName.trim(),
        lastBookedAt: createdStr,
        sortTime,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.sortTime - a.sortTime)
    .map(({ phone, name, lastBookedAt }) => ({
      phone,
      name,
      lastBookedAt,
    }));
}

/**
 * Returns grouped known clients with non-empty phone, sorted by lastBookedAt newest first.
 * Supports passing live appointments synchronously or fetching async if omitted.
 */
export function getKnownClients(appointments: Appointment[]): KnownClient[];
export function getKnownClients(): Promise<KnownClient[]>;
export function getKnownClients(
  appointments?: Appointment[]
): KnownClient[] | Promise<KnownClient[]> {
  if (appointments !== undefined) {
    return parseKnownClients(appointments);
  }
  return getAppointments().then(parseKnownClients);
}

export async function getAppointmentsByPhone(phone: string): Promise<Appointment[]> {
  const target = normalizePhoneDigits(phone);
  if (!target) return [];

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("phone", target)
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) {
    console.error("Error fetching appointments by phone:", error);
    throw error;
  }

  return (data || []).map(mapRowToAppointment);
}

/**
 * Returns all 18 fixed slots for a given date ("YYYY-MM-DD")
 * with { time: "HH:mm", available: boolean }.
 * Taken slots and slots earlier than getNow() on today's date are available = false.
 */
export async function getSlotsForDate(
  date: string,
  excludeAppointmentId?: string
): Promise<{ time: string; available: boolean }[]> {
  const now = getNow();
  const todayStr = getTodayStr();
  const isToday = date === todayStr;
  const isPastDate = date < todayStr;

  let query = supabase
    .from("appointments")
    .select("id, time, status, client_action")
    .eq("date", date)
    .eq("status", "Booked")
    .eq("client_action", "none");

  if (excludeAppointmentId) {
    query = query.neq("id", excludeAppointmentId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching booked slots for date:", error);
  }

  const takenSlots = new Set((data || []).map((row) => row.time));

  return FIXED_SLOTS_24H.map((slotTime) => {
    if (isPastDate) {
      return { time: slotTime, available: false };
    }

    if (isToday) {
      const [slotH, slotM] = slotTime.split(":").map(Number);
      const slotMinutes = slotH * 60 + slotM;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotMinutes <= nowMinutes) {
        return { time: slotTime, available: false };
      }
    }

    const isTaken = takenSlots.has(slotTime);

    return {
      time: slotTime,
      available: !isTaken,
    };
  });
}

/**
 * Books a new appointment after re-checking slot availability.
 */
export async function bookAppointment({
  clientName,
  phone,
  date,
  time,
}: {
  clientName: string;
  phone: string;
  date: string;
  time: string;
}): Promise<{ ok: boolean; appointment?: Appointment; reason?: string }> {
  // Pre-check slot availability
  const slots = await getSlotsForDate(date);
  const targetSlot = slots.find((s) => s.time === time);

  if (!targetSlot || !targetSlot.available) {
    return { ok: false, reason: "slot_taken" };
  }

  const normalizedPhone = normalizePhoneDigits(phone);

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      client_name: clientName.trim(),
      phone: normalizedPhone ? normalizedPhone : null,
      date,
      time,
      status: "Booked",
      confirmed: false,
      client_action: "none",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, reason: "slot_taken" };
    }
    console.error("Error booking appointment:", error);
    return { ok: false, reason: error.message };
  }

  return { ok: true, appointment: mapRowToAppointment(data) };
}

/**
 * Reschedules an appointment:
 * 1. Checks new slot availability first (not offering what client already holds).
 * 2. Creates a NEW row for the new slot.
 * 3. Marks old row clientAction = "Rescheduled".
 * 4. Releases the old slot only after the new one succeeds.
 */
export async function rescheduleAppointment(
  id: string,
  newDate: string,
  newTime: string
): Promise<{ ok: boolean; appointment?: Appointment; reason?: string }> {
  // Fetch old appointment
  const { data: oldRow, error: fetchErr } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !oldRow) {
    return { ok: false, reason: "not_found" };
  }

  if (oldRow.date === newDate && oldRow.time === newTime) {
    return { ok: false, reason: "same_slot" };
  }

  const slots = await getSlotsForDate(newDate, id);
  const targetSlot = slots.find((s) => s.time === newTime);

  if (!targetSlot || !targetSlot.available) {
    return { ok: false, reason: "slot_taken" };
  }

  // Create NEW row
  const { data: newRow, error: insertErr } = await supabase
    .from("appointments")
    .insert({
      client_name: oldRow.client_name,
      phone: oldRow.phone,
      date: newDate,
      time: newTime,
      status: "Booked",
      confirmed: false, // confirmed = false as required
      client_action: "none",
      rescheduled_from: id,
    })
    .select()
    .single();

  if (insertErr) {
    if (insertErr.code === "23505") {
      return { ok: false, reason: "slot_taken" };
    }
    return { ok: false, reason: insertErr.message };
  }

  // Mark old appointment as Rescheduled
  const { error: updateErr } = await supabase
    .from("appointments")
    .update({ client_action: "Rescheduled" })
    .eq("id", id);

  if (updateErr) {
    console.error("Warning: Failed to mark old appointment as rescheduled:", updateErr);
  }

  return { ok: true, appointment: mapRowToAppointment(newRow) };
}

/**
 * Cancels an appointment. The slot becomes free again.
 */
export async function cancelAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update({ client_action: "Cancelled" })
    .eq("id", id);

  if (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
}

/**
 * Confirms an appointment (sets confirmed = true).
 */
export async function confirmAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update({ confirmed: true })
    .eq("id", id);

  if (error) {
    console.error("Error confirming appointment:", error);
    throw error;
  }
}

/**
 * Updates status (Booked | Done | No-show).
 */
export async function updateStatus(
  id: string,
  status: "Booked" | "Done" | "No-show"
): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
}

/**
 * Adds an appointment via Admin management drawer.
 */
export async function addAppointmentByAdmin({
  clientName,
  phone,
  date,
  time,
}: {
  clientName: string;
  phone: string;
  date: string;
  time: string;
}): Promise<{ ok: boolean; appointment?: Appointment; reason?: string }> {
  return bookAppointment({ clientName, phone, date, time });
}

/**
 * Updates client name and/or phone of an existing appointment.
 */
export async function updateAppointment(
  id: string,
  patch: { clientName?: string; phone?: string }
): Promise<void> {
  const update: Record<string, string | null> = {};
  if (patch.clientName !== undefined) update.client_name = patch.clientName.trim();
  if (patch.phone !== undefined) {
    const normalized = normalizePhoneDigits(patch.phone);
    update.phone = normalized || null;
  }
  const { error } = await supabase
    .from("appointments")
    .update(update)
    .eq("id", id);
  if (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
}

/**
 * Hard-deletes an appointment row.
 */
export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
}

/**
 * Restores demo seed data relative to today.
 */
export async function resetDemoData(): Promise<void> {
  const now = getNow();
  const todayStr = getTodayStr();
  const { error } = await supabase.rpc("reset_demo_data", { base_date: todayStr });
  if (error) {
    console.warn("RPC reset_demo_data failed or unavailable, using fallback insert:", error);
    await supabase.from("appointments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const relativeSeeds = [
      { clientName: "Riya Shah", phone: "9820011111", daysOffset: 1, time: "10:00", status: "Booked" as const, confirmed: false },
      { clientName: "Riya Shah", phone: "9820011111", daysOffset: 17, time: "16:30", status: "Booked" as const, confirmed: false },
      { clientName: "Riya Shah", phone: "9820011111", daysOffset: -3, time: "16:00", status: "Done" as const, confirmed: true },
      { clientName: "Riya Shah", phone: "9820011111", daysOffset: -4, time: "10:00", status: "Done" as const, confirmed: true },
      { clientName: "Arjun Mehta", phone: "9820022222", daysOffset: -4, time: "11:30", status: "Done" as const, confirmed: true },
      { clientName: "Meera Iyer", phone: null, daysOffset: -5, time: "09:00", status: "Done" as const, confirmed: true },
      { clientName: "Kabir Rao", phone: "9820033333", daysOffset: -6, time: "14:00", status: "No-show" as const, confirmed: true },
    ];
    await supabase.from("appointments").insert(
      relativeSeeds.map((s) => ({
        client_name: s.clientName,
        phone: s.phone,
        date: format(addDays(now, s.daysOffset), "yyyy-MM-dd"),
        time: s.time,
        status: s.status,
        confirmed: s.confirmed,
        client_action: "none",
        rescheduled_from: null,
      }))
    );
  }
}
