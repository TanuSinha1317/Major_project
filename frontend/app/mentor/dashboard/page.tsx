"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api } from "@/lib/api";
import { MentorAccount } from "@/lib/mentor-accounts";

function MentorDashboardContent() {
  const [mentor, setMentor] = useState<MentorAccount | null>(null); const [error, setError] = useState("");
  useEffect(() => { api.get<MentorAccount>("/mentor/profile").then(response => setMentor(response.data)).catch(() => setError("Unable to load your mentor profile.")); }, []);
  return <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8"><p className="text-sm font-semibold text-blue-700">Mentor workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Mentor Dashboard</h1>{error ? <p className="mt-7 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : !mentor ? <p className="mt-7 text-slate-500">Loading mentor profile…</p> : <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7"><p className="text-sm text-slate-500">Welcome</p><h2 className="mt-1 text-2xl font-bold text-slate-950">{mentor.name}</h2><div className="mt-5 grid gap-4 text-sm sm:grid-cols-3"><div><p className="text-slate-500">Employee ID</p><p className="mt-1 font-semibold">{mentor.employeeId}</p></div><div><p className="text-slate-500">Department</p><p className="mt-1 font-semibold">{mentor.department}</p></div><div><p className="text-slate-500">Designation</p><p className="mt-1 font-semibold">{mentor.designation}</p></div></div><p className="mt-7 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">Student monitoring and attendance features will appear here.</p></section>}</main>;
}

export default function MentorDashboardPage() { return <ProtectedRoute role="MENTOR"><AppFrame><MentorDashboardContent /></AppFrame></ProtectedRoute>; }
