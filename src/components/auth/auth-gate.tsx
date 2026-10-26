"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session-context";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGate({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [router, status]);

  if (status !== "authenticated") {
    return <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4"><div className="w-full max-w-sm space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><Skeleton className="h-4 w-32" /><Skeleton className="h-9 w-full" /></div></main>;
  }

  return children;
}
