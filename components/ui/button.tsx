import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 border text-sm font-semibold uppercase tracking-[0.22em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-lime-300 bg-lime-300 px-5 py-3 text-black hover:bg-lime-200 hover:border-lime-200",
        secondary: "border-white/15 bg-white/5 px-5 py-3 text-white hover:border-white/25 hover:bg-white/10",
        ghost: "border-transparent bg-transparent px-3 py-2 text-white hover:bg-white/5",
        outline: "border-white/15 bg-transparent px-5 py-3 text-white hover:border-lime-300 hover:text-lime-300",
      },
      size: {
        default: "min-h-11",
        sm: "min-h-9 px-3 py-2 text-xs",
        lg: "min-h-12 px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
