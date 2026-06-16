import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight ring-offset-background transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-brand-violet to-brand-indigo text-white shadow-glow hover:-translate-y-0.5 hover:brightness-110",
        hero:
          "bg-gradient-to-r from-brand-gold via-brand-fuchsia to-brand-cyan text-white shadow-glow hover:-translate-y-0.5 hover:brightness-110",
        destructive:
          "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md hover:-translate-y-0.5 hover:brightness-110",
        outline:
          "border border-slate-300 bg-white/70 text-slate-700 hover:bg-white hover:-translate-y-0.5",
        secondary:
          "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 hover:-translate-y-0.5",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        glass:
          "bg-white/10 text-white border border-white/20 backdrop-blur hover:bg-white/20 hover:-translate-y-0.5",
        link: "text-brand-violet underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
