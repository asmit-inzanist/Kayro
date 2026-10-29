"use client";

import React from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, CheckCircle2, Clock, XCircle } from "lucide-react";

interface StatusDropdownProps {
  status: "Booked" | "Done" | "No-show";
  onStatusChange: (newStatus: "Booked" | "Done" | "No-show") => void;
}

export function StatusDropdown({ status, onStatusChange }: StatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1 focus:outline-none group">
        <StatusBadge status={status} size="sm" />
        <ChevronDown className="w-3 h-3 text-[#B8B8BC] group-hover:text-white transition-colors" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-36">
        <DropdownMenuItem
          onClick={() => onStatusChange("Booked")}
          className="gap-2 text-xs"
        >
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Booked</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onStatusChange("Done")}
          className="gap-2 text-xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Done</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onStatusChange("No-show")}
          className="gap-2 text-xs"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>No-show</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

