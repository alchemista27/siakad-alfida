import React from "react";
import { cn } from "./utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// Sesuai DESIGN.md: backgroundColor: surface (#FFFFFF), textColor: primary (#454545), rounded: rounded.md (8px), padding: 20px, hairline border (#E3E8E7)
export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white border border-[#E3E8E7] rounded-lg p-5 shadow-xs overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("border-b border-[#E3E8E7] pb-3 mb-4 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      className={cn("text-lg font-bold font-heading text-[#454545]", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
};
