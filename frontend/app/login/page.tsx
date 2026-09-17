"use client";

import { FormEvent, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { api, ApiError, AuthUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter(); const { user, loading, refresh } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState("");
  const destination = (account: AuthUser) => account.role === "ADMIN" ? "/admin/dashboard" : account.mustChangePassword ? "/student/change-password" : "/student/dashboard";
  useEffect(() => { if (!loading && user) router.replace(destination(user)); }, [loading, user, router]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try {
      const { data } = await api.post<AuthUser>("/auth/login", { email, password });
      await refresh(); router.replace(destination(data));
    } catch (cause) {
      const response = (cause as AxiosError<ApiError>).response;
      setError(response?.data?.message ?? "Unable to sign in. Please try again.");
    } finally { setSubmitting(false); }
  }
  if (user) return <main className="grid min-h-screen place-items-center"><p className="text-sm text-slate-500">Checking your session…</p></main>;
  return <main className="grid min-h-screen lg:grid-cols-2">
    <section className="hidden bg-[#123052] p-14 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-sm font-bold">IMS</span><span className="font-semibold">Internship Management System</span></div>
      <div className="max-w-xl"><p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-blue-200">One connected journey</p><h1 className="text-5xl font-bold leading-tight">Internships, progress and outcomes—together.</h1><p className="mt-6 text-lg leading-8 text-slate-300">A secure institutional workspace for students and the III Cell.</p></div>
      <p className="text-sm text-slate-400">Institution-managed accounts only</p>
    </section>
    <section className="flex items-center justify-center px-6 py-12"><div className="w-full max-w-md">
      <div className="mb-10 lg:hidden"><p className="font-bold text-blue-700">IMS</p><p className="text-sm text-slate-500">Internship Management System</p></div>
      <p className="text-sm font-semibold text-blue-700">Welcome back</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in to your account</h2><p className="mt-3 text-slate-600">Use the email and password provided by your institution.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block"><span className="mb-2 block text-sm font-semibold">Email address</span><input autoComplete="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" placeholder="you@institution.edu" /></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold">Password</span><input autoComplete="current-password" type="password" required minLength={1} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" placeholder="Enter your password" /></label>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button disabled={submitting} className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="mt-8 text-center text-xs leading-5 text-slate-500">Accounts are created and managed by the III Cell.</p>
    </div></section>
  </main>;
}
