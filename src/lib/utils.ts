import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addDays } from "date-fns";
import { Appointment, DEMO_NOW, DEMO_TODAY_STR } from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a phone number by stripping spaces, hyphens, and +91 country prefix.
 * Returns exactly 10 digits or an empty string.
 */
export function normalizePhone(raw: string | undefined | null): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2, 12);
  }
  return digits.slice(-10);
}

/**
 * Formats 10-digit phone as "98200 11111".
 * Returns "—" if phone is missing or empty.
 */
export function formatPhone(phone: string | undefined | null): string {
  const norm = normalizePhone(phone);
  if (!norm || norm.length < 10) return "—";
  return `${norm.slice(0, 5)} ${norm.slice(5)}`;
}

/**
 * Converts a "YYYY-MM-DD" string into formatted date label without hardcoding weekday names.
 * Default pattern: "EEE d MMM" -> "Thu 29 Oct"
 */
export function formatDateLabel(
  dateStr: string,
  formatPattern: string = "EEE d MMM"
): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return format(d, formatPattern);
    }
    // Fallback if already formatted
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Converts "HH:mm" 24-hour time string into "h:mm a" (e.g. "16:30" -> "4:30 PM", "10:00" -> "10:00 AM").
 */
export function formatTimeLabel(timeStr: string): string {
  if (!timeStr) return "";
  if (timeStr.includes("AM") || timeStr.includes("PM")) {
    return timeStr;
  }
  try {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const d = new Date(2026, 9, 28, parts[0], parts[1]);
      return format(d, "h:mm a");
    }
    return timeStr;
  } catch (e) {
    return timeStr;
  }
}

/**
 * Calculates end time for a given start time + duration (default 45 min)
 * e.g. "10:00" -> "10:45 AM", "16:30" -> "5:15 PM"
 */
export function formatEndTime(timeStr: string, durationMinutes = 45): string {
  if (!timeStr) return "";
  try {
    let h = 10;
    let m = 0;
    if (timeStr.includes(":")) {
      const cleanTime = timeStr.replace(/[^\d:]/g, "");
      const [hStr, mStr] = cleanTime.split(":");
      h = parseInt(hStr, 10);
      m = parseInt(mStr, 10);
      if (timeStr.toUpperCase().includes("PM") && h < 12) h += 12;
      if (timeStr.toUpperCase().includes("AM") && h === 12) h = 0;
    }
    const d = new Date(2026, 9, 28, h, m + durationMinutes);
    return format(d, "h:mm a");
  } catch (e) {
    return "";
  }
}

/**
 * Creates Date object for an appointment using its date ("YYYY-MM-DD") and time ("HH:mm")
 */
export function getAppointmentDateTime(appointment: Appointment): Date {
  const [y, m, d] = appointment.date.split("-").map(Number);
  let h = 0;
  let min = 0;
  if (appointment.time.includes(":")) {
    const cleanTime = appointment.time.replace(/[^\d:]/g, "");
    const [hStr, minStr] = cleanTime.split(":");
    h = parseInt(hStr, 10);
    min = parseInt(minStr, 10);
    if (appointment.time.toUpperCase().includes("PM") && h < 12) h += 12;
    if (appointment.time.toUpperCase().includes("AM") && h === 12) h = 0;
  }
  return new Date(y, m - 1, d, h, min);
}

/**
 * Determines whether an appointment is within 24 hours of DEMO_NOW.
 * DEMO_NOW = 2026-10-28 11:00 IST.
 * e.g. an appointment on 2026-10-29 10:00 is 23h ahead -> true.
 */
export function isWithin24h(appointment: Appointment): boolean {
  if (appointment.clientAction !== "none") return false;
  const aptDate = getAppointmentDateTime(appointment);
  const diffMs = aptDate.getTime() - DEMO_NOW.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= 24;
}

/**
 * Checks if appointment is upcoming relative to DEMO_NOW.
 */
export function isUpcoming(appointment: Appointment): boolean {
  if (appointment.clientAction !== "none") return false;
  if (appointment.status !== "Booked") return false;
  const aptDate = getAppointmentDateTime(appointment);
  return aptDate.getTime() >= DEMO_NOW.getTime();
}

/**
 * Generates personalized WhatsApp confirmation/reminder link.
 */
export function whatsappLink(appointment: Appointment): string {
  const phone = normalizePhone(appointment.phone);
  if (!phone) return "#";
  const clientFirstName = appointment.clientName.split(" ")[0] || "there";
  const dateStr = formatDateLabel(appointment.date);
  const timeStr = formatTimeLabel(appointment.time);
  const messageBody = `Hi ${clientFirstName}, your session with Dr. Anika is tomorrow, ${dateStr} at ${timeStr}. Reply YES to confirm or tell us if you need to reschedule.`;
  return `https://wa.me/91${phone}?text=${encodeURIComponent(messageBody)}`;
}

/**
 * Generates 14 consecutive bookable dates starting from DEMO_NOW date.
 */
export function getBookableDays(count = 14): {
  dateStr: string; // "YYYY-MM-DD"
  dayName: string; // "WED"
  dayNum: number; // 28
  fullDate: string; // "Wednesday, 28 Oct 2026"
  isToday: boolean;
}[] {
  const days: ReturnType<typeof getBookableDays> = [];
  for (let i = 0; i < count; i++) {
    const d = addDays(DEMO_NOW, i);
    const dateStr = format(d, "yyyy-MM-dd");
    days.push({
      dateStr,
      dayName: format(d, "EEE").toUpperCase(),
      dayNum: parseInt(format(d, "d"), 10),
      fullDate: format(d, "EEEE, d MMM yyyy"),
      isToday: dateStr === DEMO_TODAY_STR,
    });
  }
  return days;
}
