export function FormError({ message }: Readonly<{ message?: string }>) {
  return message ? <p className="mt-1.5 text-xs text-[var(--danger)]">{message}</p> : null;
}
