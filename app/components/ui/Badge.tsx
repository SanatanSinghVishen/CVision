import { HTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "outline";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[#27272A] text-[#F8F9FC]",
      success: "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20",
      warning: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
      error: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
      outline: "border border-[#3F3F46] text-[#A1A1AA]"
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
