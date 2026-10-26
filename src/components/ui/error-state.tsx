import { AlertTriangle } from "lucide-react";
import { Alert } from "@/components/ui/alert";

export function ErrorState({ title, message }: Readonly<{ title: string; message: string }>) {
  return (
    <Alert tone="danger" role="alert">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
          <AlertTriangle className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="font-semibold text-[var(--text)]">{title}</p>
          <p className="mt-0.5 text-xs leading-5 text-[var(--text-soft)]">{message}</p>
        </div>
      </div>
    </Alert>
  );
}
