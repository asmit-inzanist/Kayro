import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addDays } from "date-fns";
import { Appointment, getNow, getTodayStr, getTomorrowStr } from "./data";

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
      const now = getNow();
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parts[0], parts[1]);
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
    const now = getNow();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m + durationMinutes);
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
 * Determines whether an appointment is within 24 hours of getNow().
 * Fires for an unconfirmed upcoming appointment whose date is today (time still ahead) or tomorrow.
 */
export function isWithin24h(appointment: Appointment): boolean {
  if (appointment.clientAction !== "none") return false;
  if (appointment.status !== "Booked") return false;
  if (appointment.confirmed) return false;

  const now = getNow();
  const aptDate = getAppointmentDateTime(appointment);
  if (aptDate.getTime() <= now.getTime()) return false;

  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();

  return appointment.date === todayStr || appointment.date === tomorrowStr;
}

/**
 * Checks if appointment is upcoming relative to getNow().
 * "Upcoming" = status Booked, client_action "none", and date+time after getNow().
 */
export function isUpcoming(appointment: Appointment): boolean {
  if (appointment.clientAction !== "none") return false;
  if (appointment.status !== "Booked") return false;
  const aptDate = getAppointmentDateTime(appointment);
  return aptDate.getTime() > getNow().getTime();
}

/**
 * Checks if appointment is past relative to getNow().
 * Defined as: aptDate <= getNow()
 */
export function isPastAppointment(appointment: Appointment): boolean {
  const aptDate = getAppointmentDateTime(appointment);
  return aptDate.getTime() <= getNow().getTime();
}

/**
 * Generates personalized WhatsApp confirmation/reminder link.
 */
export function whatsappLink(appointment: Appointment): string {
  const phone = normalizePhone(appointment.phone);
  if (!phone) return "#";
  const clientFirstName = appointment.clientName.split(" ")[0] || "there";
  const now = getNow();
  const tomorrowStr = getTomorrowStr();
  const todayStr = getTodayStr();
  const isTomorrow = appointment.date === tomorrowStr;
  const isToday = appointment.date === todayStr;
  const dateRef = isTomorrow
    ? `tomorrow, ${formatDateLabel(appointment.date)}`
    : isToday
    ? `today, ${formatDateLabel(appointment.date)}`
    : `on ${formatDateLabel(appointment.date)}`;
  const timeStr = formatTimeLabel(appointment.time);
  const messageBody = `Hi ${clientFirstName}, your session with Dr. Kayro is ${dateRef} at ${timeStr}. Reply YES to confirm or tell us if you need to reschedule.`;
  return `https://wa.me/91${phone}?text=${encodeURIComponent(messageBody)}`;
}

/**
 * Generates 14 consecutive bookable dates starting from today.
 */
export function getBookableDays(count = 14): {
  dateStr: string; // "YYYY-MM-DD"
  dayName: string; // "WED"
  dayNum: number; // 28
  fullDate: string; // e.g. "Wednesday, 28 Oct"
  isToday: boolean;
  isSunday: boolean;
}[] {
  const days: ReturnType<typeof getBookableDays> = [];
  const now = getNow();
  const todayStr = getTodayStr();
  for (let i = 0; i < count; i++) {
    const d = addDays(now, i);
    const dateStr = format(d, "yyyy-MM-dd");
    days.push({
      dateStr,
      dayName: format(d, "EEE").toUpperCase(),
      dayNum: parseInt(format(d, "d"), 10),
      fullDate: format(d, "EEEE, d MMM yyyy"),
      isToday: dateStr === todayStr,
      isSunday: d.getDay() === 0,
    });
  }
  return days;
}
