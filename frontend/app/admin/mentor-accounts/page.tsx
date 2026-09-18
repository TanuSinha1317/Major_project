"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { AppFrame } from "@/components/AppFrame";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api, ApiError } from "@/lib/api";
import { MentorAccount, MentorAccountInput } from "@/lib/mentor-accounts";

const emptyForm: MentorAccountInput = { name: "", employeeId: "", instituteEmail: "", department: "", designation: "", phone: "" };

function MentorAccountsContent() {
  const [mentors, setMentors] = useState<MentorAccount[]>([]); const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const load = useCallback(async () => { try { const { data } = await api.get<MentorAccount[]>("/admin/mentor-accounts"); setMentors(data); } catch { setError("Unable to load mentor accounts."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  function update(field: keyof MentorAccountInput, value: string) { setForm(current => ({ ...current, [field]: value })); }
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setSuccess(""); setSaving(true);
    try {
      const { data } = await api.post<MentorAccount>("/admin/mentor-accounts", form);
      setMentors(current => [...current, data].sort((a, b) => a.name.localeCompare(b.name))); setForm(emptyForm);
      setSuccess(`Mentor account created for ${data.name}. Their Employee ID is the temporary login credential.`);
    } catch (cause) {
      const response = (cause as AxiosError<ApiError>).response?.data;
      const fields = response?.fieldErrors ? Object.values(response.fieldErrors).join(" ") : "";
      setError(fields || response?.message || "Unable to create the mentor account.");
    } finally { setSaving(false); }
  }
  const fields: Array<[keyof MentorAccountInput, string, string]> = [["name", "Name", "text"], ["employeeId", "Employee ID", "text"], ["instituteEmail", "Institute Email", "email"], ["department", "Department", "text"], ["designation", "Designation", "text"], ["phone", "Phone", "tel"]];
  return <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><p className="text-sm font-semibold text-blue-700">III Cell workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Mentor Account Management</h1><p className="mt-2 text-slate-600">Create institution-managed mentor accounts and review existing faculty mentors.</p><div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,420px)_1fr]"><section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Create Mentor</h2><p className="mt-2 text-sm text-slate-600">The Employee ID becomes the temporary password and must be changed after first login.</p><form onSubmit={submit} className="mt-6 space-y-4">{fields.map(([field, label, type]) => <label key={field} className="block"><span className="mb-1.5 block text-sm font-semibold">{label}</span><input type={type} required maxLength={field === "instituteEmail" ? 254 : field === "employeeId" ? 50 : field === "phone" ? 25 : 150} value={form[field]} onChange={event => update(field, event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" /></label>)}{error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{success && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</p>}<button disabled={saving} className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-60">{saving ? "Creating…" : "Create Mentor Account"}</button></form></section><section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Existing Mentors</h2>{loading ? <p className="mt-6 text-slate-500">Loading mentors…</p> : mentors.length === 0 ? <p className="mt-6 text-slate-500">No mentor accounts have been created.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3">Mentor</th><th className="pb-3">Employee ID</th><th className="pb-3">Department</th><th className="pb-3">Designation</th><th className="pb-3">Status</th></tr></thead><tbody>{mentors.map(mentor => <tr key={mentor.id} className="border-b border-slate-100 last:border-0"><td className="py-4"><p className="font-semibold text-slate-900">{mentor.name}</p><p className="mt-1 text-xs text-slate-500">{mentor.instituteEmail}</p></td><td className="py-4 font-medium">{mentor.employeeId}</td><td className="py-4">{mentor.department}</td><td className="py-4">{mentor.designation}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${mentor.mustChangePassword ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>{mentor.mustChangePassword ? "Password change pending" : "Active"}</span></td></tr>)}</tbody></table></div>}</section></div></main>;
}

export default function MentorAccountsPage() { return <ProtectedRoute role="ADMIN"><AppFrame><MentorAccountsContent /></AppFrame></ProtectedRoute>; }
