"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { formatPhone, normalizePhone } from "@/lib/utils";
import { LayoutDashboard, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ClientSwitcherContentProps {
  onClose: () => void;
}

export function ClientSwitcherContent({ onClose }: ClientSwitcherContentProps) {
  const { knownClients, deviceIdentity, setDeviceIdentity, setRole } = useRole();

  const currentNormPhone = normalizePhone(deviceIdentity.phone);

  return (
    <div className="w-full text-left font-sans select-none">
      {/* Title */}
      <div className="px-3 pt-1 pb-2 text-xs font-semibold text-[#B8B8BC]">
        Switch client (demo)
      </div>

      {/* Top row, pinned: Nutritionist dashboard */}
      <button
        type="button"
        onClick={() => {
          setRole("admin");
          onClose();
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#2A2A2C] transition-colors text-left cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-full bg-[#1E3D2C] border border-[#2B5040] flex items-center justify-center text-[#34D399] shrink-0">
          <LayoutDashboard className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-[#F5F2EC] group-hover:text-[#F4694C] transition-colors block">
            Nutritionist dashboard
          </span>
          <span className="text-[11px] text-[#B8B8BC] block">
            Dr. Kayro • Practice View
          </span>
        </div>
      </button>

      {/* A thin divider (#2A2A2C) */}
      <div className="my-2 border-t border-[#2A2A2C]" />

      {/* Known clients list */}
      <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5">
        {knownClients.map((client) => {
          const clientNormPhone = normalizePhone(client.phone);
          const isCurrent = Boolean(
            currentNormPhone && clientNormPhone === currentNormPhone
          );
          const initials =
            client.name
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "C";

          return (
            <button
              key={client.phone}
              type="button"
              onClick={() => {
                setDeviceIdentity({
                  name: client.name,
                  phone: client.phone,
                });
                onClose();
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left cursor-pointer group",
                isCurrent
                  ? "bg-[#2A2A2C] border border-[#3A3A3C]"
                  : "hover:bg-[#2A2A2C]/60"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {client.name === "Riya Shah" ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#7C3AED] flex items-center justify-center p-1 border border-[#4A4A4C]">
                    <img
                      src="/people_17742292.png"
                      alt={client.name}
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#3A3A3C] border border-[#4A4A4C] flex items-center justify-center text-xs font-semibold text-[#F5F2EC] shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-sm font-medium text-[#F5F2EC] block truncate group-hover:text-[#F4694C] transition-colors">
                    {client.name}
                  </span>
                  <span className="text-xs text-[#B8B8BC] tabular-nums block">
                    {formatPhone(client.phone)}
                  </span>
                </div>
              </div>

              {isCurrent && (
                <Check className="w-4 h-4 text-[#F4694C] shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Small footer text in #B8B8BC */}
      <div className="pt-2.5 mt-2 border-t border-[#2A2A2C] px-3 pb-1 text-[11px] text-[#B8B8BC] text-center">
        Demo only. A real client would use their own phone.
      </div>
    </div>
  );
}

export function ClientSwitcherPopover({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={14}
        className="w-80 bg-[#1E1E20] border-[#3A3A3C] p-3 shadow-2xl rounded-[22px]"
      >
        <ClientSwitcherContent onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

export function ClientSwitcherSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-[#1E1E20] border-[#3A3A3C] rounded-t-[28px] p-4 max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Switch client (demo)</SheetTitle>
        </SheetHeader>
        <ClientSwitcherContent onClose={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

