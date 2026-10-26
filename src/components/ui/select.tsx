"use client"

import * as React from "react"
import { cn } from "cn"
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full min-w-0 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] shadow-[0_1px_2px_rgba(16,26,51,0.025)] transition-[border-color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
      className
    )}
    {...props}
  >
    {children}
  </select>
))

Select.displayName = "Select"

function SelectGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="select-group" className={cn(className)} {...props} />
}

function SelectValue({ className, ...props }: React.ComponentProps<"option">) {
  return <option data-slot="select-value" className={cn(className)} {...props} />
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select-trigger"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] shadow-[0_1px_2px_rgba(16,26,51,0.025)] transition-[border-color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

function SelectContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="select-content" className={cn(className)} {...props}>
      {children}
    </div>
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<"option">) {
  return (
    <option data-slot="select-item" className={cn(className)} {...props}>
      {children}
    </option>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label data-slot="select-label" className={cn(className)} {...props} />
}

function SelectSeparator({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr data-slot="select-separator" className={cn("my-1 h-px bg-border", className)} {...props} />
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-scroll-up-button" className={cn(className)} {...props} />
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-scroll-down-button" className={cn(className)} {...props} />
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
