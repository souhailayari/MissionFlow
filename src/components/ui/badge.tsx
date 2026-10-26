import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

type BadgeTone =
  | NonNullable<VariantProps<typeof badgeVariants>["variant"]>
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0 text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-[var(--brand-soft)] bg-[var(--brand-soft)] text-[var(--brand-strong)]",
        secondary: "border-[var(--line)] bg-[var(--surface-muted)] text-[var(--text-soft)]",
        destructive: "border-[var(--danger-soft)] bg-[var(--danger-soft)] text-[var(--danger)]",
        outline: "border-[var(--info-soft)] bg-[var(--info-soft)] text-[var(--info)]",
        ghost: "border-[var(--line)] bg-transparent text-[var(--text-soft)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const toneClasses: Record<NonNullable<BadgeTone> extends string ? Extract<BadgeTone, "neutral" | "info" | "success" | "warning" | "danger"> : never, string> = {
  neutral: "border-[var(--line)] bg-[var(--surface-muted)] text-[var(--text-soft)]",
  info: "border-[var(--info-soft)] bg-[var(--info-soft)] text-[var(--info)]",
  success: "border-[var(--success-soft)] bg-[var(--success-soft)] text-[var(--success)]",
  warning: "border-[var(--warning-soft)] bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "border-[var(--danger-soft)] bg-[var(--danger-soft)] text-[var(--danger)]",
};

function Badge({
  className,
  variant = "default",
  tone,
  render,
  ...props
}: useRender.ComponentProps<"span"> & {
  variant?: string
  tone?: BadgeTone
}) {
  const toneClass = tone && tone in toneClasses ? toneClasses[tone as keyof typeof toneClasses] : undefined;
  const resolvedVariant: NonNullable<VariantProps<typeof badgeVariants>["variant"]> =
    tone === "neutral"
      ? "secondary"
      : tone === "info"
        ? "outline"
        : tone === "success"
          ? "default"
          : tone === "warning"
            ? "outline"
            : tone === "danger"
              ? "destructive"
              : tone === "default"
                ? "default"
                : (variant as NonNullable<VariantProps<typeof badgeVariants>["variant"]>) ?? "default";

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant: resolvedVariant }), toneClass, className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant: resolvedVariant,
    },
  })
}

export { Badge, badgeVariants }
