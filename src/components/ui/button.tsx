import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import * as React from "react"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[background-color,border-color,box-shadow,transform] duration-180 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand)] text-white shadow-[0_8px_18px_rgba(79,70,229,0.2)] hover:bg-[var(--brand-strong)] hover:shadow-[0_10px_22px_rgba(79,70,229,0.24)]",
        outline:
          "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] shadow-[0_1px_0_rgba(16,26,51,0.025)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] aria-expanded:bg-[var(--brand-soft)]",
        secondary:
          "border border-[var(--line)] bg-[var(--surface-muted)] text-[var(--text)] hover:bg-[var(--brand-soft)] aria-expanded:bg-[var(--brand-soft)]",
        ghost:
          "text-[var(--text-soft)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] aria-expanded:bg-[var(--surface-muted)]",
        destructive: "bg-[var(--danger)] text-white shadow-[0_8px_18px_rgba(187,65,77,0.18)] hover:brightness-95 focus-visible:ring-red-200/60",
        link: "text-[var(--brand-strong)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-8 gap-1 rounded-lg px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-10 gap-1.5 rounded-xl px-3.5 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 rounded-2xl px-5 text-sm",
        icon: "size-11 rounded-xl",
        "icon-xs": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-10 rounded-xl [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonVariant =
  | NonNullable<VariantProps<typeof buttonVariants>["variant"]>
  | "primary"
  | "danger"
  | "success"
  | "warning";

type ResolvedButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

export function resolveButtonVariant(variant: ButtonVariant | null | undefined): ResolvedButtonVariant {
  switch (variant) {
    case "primary": return "default";
    case "danger": return "destructive";
    case "success": return "secondary";
    case "warning": return "outline";
    case null:
    case undefined: return "default";
    default: return variant;
  }
}

type ButtonProps = Omit<ButtonPrimitive.Props, "variant"> & {
  variant?: ButtonVariant
  size?: VariantProps<typeof buttonVariants>["size"]
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isLoading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  leftIcon,
  rightIcon,
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const resolvedVariant = resolveButtonVariant(variant);

  return (
    <ButtonPrimitive
      data-slot="button"
      data-size={size}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(buttonVariants({ variant: resolvedVariant, size, className }))}
      {...props}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {!isLoading && leftIcon ? (
        <span className="inline-flex shrink-0 items-center justify-center">{leftIcon}</span>
      ) : null}
      {children ? <span className="inline-flex items-center">{children}</span> : null}
      {!isLoading && rightIcon ? (
        <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>
      ) : null}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
