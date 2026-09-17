"use client";

import { Role } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth(); const router = useRouter(); const pathname = usePathname();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
    else if (user.role === "STUDENT" && user.mustChangePassword && pathname !== "/student/change-password") router.replace("/student/change-password");
  }, [loading, user, role, router, pathname]);
  if (loading || !user || user.role !== role) return <main className="grid min-h-screen place-items-center"><p className="text-sm text-slate-500">Checking your session…</p></main>;
  return <>{children}</>;
}
