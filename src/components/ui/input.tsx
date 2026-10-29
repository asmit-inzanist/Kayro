import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#3A3A3C] bg-[#1C1C1E] px-4 py-2 text-sm text-[#F5F2EC] placeholder:text-[#B8B8BC]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F4694C] focus-visible:border-[#F4694C] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

