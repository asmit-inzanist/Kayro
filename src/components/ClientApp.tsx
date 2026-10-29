"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import { ClientHome } from "./client/ClientHome";
import { ClientBook } from "./client/ClientBook";
import { ClientAppointments } from "./client/ClientAppointments";
import { ClientReschedule } from "./client/ClientReschedule";

export function ClientApp() {
  const { clientScreen } = useRole();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {clientScreen === "home" && <ClientHome />}
      {clientScreen === "book" && <ClientBook />}
      {clientScreen === "appointments" && <ClientAppointments />}
      {clientScreen === "reschedule" && <ClientReschedule />}
    </div>
  );
}

