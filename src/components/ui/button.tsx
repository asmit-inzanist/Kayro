import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#F4694C] text-[#F5F2EC] hover:bg-[#E05538] shadow-sm active:scale-[0.98]",
        coral:
          "bg-[#F4694C] text-[#F5F2EC] hover:bg-[#E05538] shadow-md shadow-[#F4694C]/20 active:scale-[0.98]",
        secondary:
          "bg-[#2A2A2C] text-[#F5F2EC] hover:bg-[#3A3A3C] border border-[#3A3A3C]",
        outline:
          "border border-[#3A3A3C] bg-transparent text-[#F5F2EC] hover:bg-[#2A2A2C]",
        ghost:
          "text-[#F5F2EC] hover:bg-[#2A2A2C] hover:text-white",
        link: "text-[#F4694C] underline-offset-4 hover:underline",
        emerald:
          "bg-[#34D399] text-white hover:bg-[#268356] shadow-sm",
        amber:
          "bg-[#F59E0B] text-[#1C1C1E] font-semibold hover:bg-[#cca32e]",
      },
      size: {
        default: "h-11 px-5 py-2.5 rounded-full",
        sm: "h-8 px-3.5 text-xs rounded-full",
        lg: "h-12 px-7 text-base rounded-full",
        icon: "h-10 w-10 rounded-full",
        "icon-sm": "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

