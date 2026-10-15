import React from "react";
import { cn } from "./utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Sesuai DESIGN.md: rounded.sm = 4px, background tertiary (#0f7f6d), text on-tertiary (#F7F8F8)
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-[#0f7f6d] text-[#F7F8F8] hover:bg-[#0b6355] focus:ring-[#0f7f6d]",
      secondary: "bg-transparent text-[#0f7f6d] border border-[#0f7f6d] hover:bg-[#e6f4f1] focus:ring-[#0f7f6d]",
      outline: "border border-[#E3E8E7] text-[#454545] hover:bg-[#F7F8F8] bg-white focus:ring-[#0f7f6d]",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs min-h-[32px]",
      md: "px-4 py-2 text-sm min-h-[40px]",
      lg: "px-5 py-2.5 text-base min-h-[46px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
