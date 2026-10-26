import type { ReactNode } from "react";
import { AdminGate } from "@/components/auth/admin-gate";

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) { return <AdminGate>{children}</AdminGate>; }