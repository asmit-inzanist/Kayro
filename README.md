# Nourish • Clinical Nutrition Consultation & Practice Management

A modern, full-stack appointment scheduling and practice management web application built for clinical nutrition practices, designed specifically for **Dr. Kayro**.

Built with **Next.js 16 (App Router + Turbopack)**, **Tailwind CSS**, and **Supabase (PostgreSQL)**.

---

## ✨ Features

### 👤 Patient Portal (Client View)
- **Consultation Booking**:
  - Interactive multi-day booking calendar with 7-day paginated view and navigation arrows.
  - Smart clinic schedule handling (Sundays marked as closed and disabled).
  - 30-minute in-clinic slot selection with conflict prevention.
  - Device/patient identity association via phone number.
- **Home & Upcoming Sessions**:
  - Hero consultation card highlighting the next scheduled session.
  - 24-hour attendance confirmation banner & modal.
  - Quick access to "Before your session" prep checklist.
  - Recent sessions timeline with accurate status indicators (*Booked*, *Done*, *No-show*, *Cancelled*, *Rescheduled*).
- **Self-Service Appointments Management**:
  - View all upcoming and past consultations.
  - One-click 24-hour session confirmation.
  - In-place appointment rescheduling with slot protection.
  - Cancellation confirmation with waitlist slot release.

### 🩺 Nutritionist Dashboard (Admin View)
- **Practice Management for Dr. Kayro**:
  - Filter consultations across All, Today, Upcoming, and Past sessions.
  - Real-time status toggles (*Booked*, *Done*, *No-show*).
  - Live patient search by name or contact number.
  - Add appointment sheet with date, slot, and patient validation.
  - Edit appointment dialog to modify slot, time, status, or notes.
  - Integrated WhatsApp reminder message dispatch with formatted appointment details.
  - Instant demo data reset RPC integration.

### 🔄 Multi-Identity Client Switcher
- Floating client switcher enabling rapid testing between known patient profiles (e.g. Riya Shah, Arjun Mehta) and the practice owner view (*Dr. Kayro*).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Database & Backend**: [Supabase](https://supabase.com/) (PostgreSQL database, Client SDK, custom RPC seed functions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: Radix UI primitives & Tailwind-styled dialogs, sheets, and popovers
- **Date Handling**: `date-fns` & custom timezone-aware date formatting utilities

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or 20+
- npm, yarn, or pnpm
- A Supabase project with database configured

### 2. Environment Setup

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Schema

The app connects to a Supabase table named `appointments` with columns:
- `id` (UUID, primary key)
- `client_name` (text)
- `phone` (text)
- `date` (date string `YYYY-MM-DD`)
- `time` (time string `HH:MM`)
- `status` (`Booked` | `Done` | `No-show`)
- `confirmed` (boolean)
- `rescheduled_from` (UUID or null)
- `client_action` (text or null: `'Cancelled'` | `'Rescheduled'`)
- `notes` (text or null)

An optional Postgres function `reset_demo_data(base_date date)` can be created to support the "Reset Demo Data" button.

### 4. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Production Build

```bash
npm run build
npm run start
```

---

## 🎨 Design System

- **Palette**: Dark luxury aesthetic (`#1C1C1E` background, `#2A2A2C` surface cards, `#3A3A3C` borders) with coral accents (`#F4694C`), emerald signals (`#34D399`), and forest green hero tones (`#365744`).
- **Typography**: Editorial serif headings (`Fraunces`) paired with geometric sans-serif body text (`Plus Jakarta Sans`).
