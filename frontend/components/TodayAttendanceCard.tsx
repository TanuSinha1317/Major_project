"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { api, ApiError } from "@/lib/api";
import { Attendance, TodayAttendance } from "@/lib/attendance";

function attendanceLabel(attendance: Attendance) {
  if (attendance.attendanceResult === "PRESENT" && attendance.verificationStatus === "UNVERIFIED") {
    return "Present — verification pending";
  }
  return attendance.attendanceResult === "PRESENT" ? "Present — verified" : "Absent";
}

export function TodayAttendanceCard() {
  const [today, setToday] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<TodayAttendance>("/student/attendance/today")
      .then(response => setToday(response.data))
      .catch(() => setError("Today's attendance status could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  async function submit() {
    setSubmitting(true); setError("");
    try {
      const { data } = await api.post<Attendance>("/student/attendance/today");
      setToday({ attendanceDate: data.attendanceDate, attendance: data });
    } catch (cause) {
      setError((cause as AxiosError<ApiError>).response?.data?.message ?? "Attendance could not be submitted.");
    } finally { setSubmitting(false); }
  }

  const attendance = today?.attendance;
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Today&apos;s Attendance</p><h2 className="mt-3 text-xl font-bold">{loading ? "Checking attendance…" : attendance ? attendanceLabel(attendance) : "Not submitted"}</h2></div>
        {attendance && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">Verification pending</span>}
      </div>
      {!loading && attendance ? <p className="mt-3 text-sm text-slate-600">Submitted at {new Date(attendance.serverSubmittedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} using server time.</p> : !loading && <p className="mt-3 text-sm text-slate-600">Attendance can be submitted once today during your registered internship period.</p>}
      {!loading && !attendance && <button type="button" disabled={submitting} onClick={() => void submit()} className="mt-6 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "Submitting…" : "Mark Today's Attendance"}</button>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
