"use client";

import type { ReactNode } from "react";
import { useSession } from "@/lib/auth/session-context";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/ui/page-container";

export function AdminGate({ children }: Readonly<{ children: ReactNode }>) {
  const { status, user } = useSession();
  if (status === "loading") return <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-20" /></div>;
  if (user?.globalRole !== "ADMIN") return <PageContainer><Alert tone="danger"><h1 className="text-sm font-semibold">Accès interdit</h1><p className="mt-1 text-sm">Cette section est réservée aux administrateurs.</p></Alert></PageContainer>;
  return children;
}