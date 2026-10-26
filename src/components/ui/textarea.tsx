import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] shadow-[0_1px_2px_rgba(16,26,51,0.025)] transition-[border-color,box-shadow] outline-none placeholder:text-[var(--text-muted)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
