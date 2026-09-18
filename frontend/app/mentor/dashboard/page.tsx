"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api } from "@/lib/api";
import { MentorAccount } from "@/lib/mentor-accounts";
import { AssignmentStudent } from "@/lib/mentor-assignments";

function MentorDashboardContent() {
  const [mentor, setMentor] = useState<MentorAccount | null>(null);
  const [students, setStudents] = useState<AssignmentStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<MentorAccount>("/mentor/profile"),
      api.get<AssignmentStudent[]>("/mentor/students")
    ]).then(([profile, assigned]) => {
      setMentor(profile.data); setStudents(assigned.data);
    }).catch(() => setError("Unable to load your mentor dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <p className="text-sm font-semibold text-blue-700">Mentor workspace</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Mentor Dashboard</h1>
      {error ? <p className="mt-7 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : loading || !mentor ? <p className="mt-7 text-slate-500">Loading mentor dashboard…</p> : (
        <>
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7">
            <p className="text-sm text-slate-500">Welcome</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{mentor.name}</h2>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-4">
              <div><p className="text-slate-500">Employee ID</p><p className="mt-1 font-semibold">{mentor.employeeId}</p></div>
              <div><p className="text-slate-500">Department</p><p className="mt-1 font-semibold">{mentor.department}</p></div>
              <div><p className="text-slate-500">Designation</p><p className="mt-1 font-semibold">{mentor.designation}</p></div>
              <div><p className="text-slate-500">Assigned Students</p><p className="mt-1 text-2xl font-bold">{students.length}</p></div>
            </div>
          </section>
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-7">
            <h2 className="text-xl font-bold">Assigned Students</h2>
            <p className="mt-2 text-sm text-slate-600">Only students currently assigned to you are shown.</p>
            {students.length === 0 ? <p className="mt-6 text-sm text-slate-500">No students are currently assigned.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3">Student</th><th className="pb-3">UID</th><th className="pb-3">Branch</th><th className="pb-3">Semester</th></tr></thead><tbody>{students.map(student => <tr key={student.userId} className="border-b border-slate-100 last:border-0"><td className="py-4 font-semibold">{student.name || "Profile incomplete"}</td><td className="py-4">{student.uid || "—"}</td><td className="py-4">{student.branchLabel || "—"}</td><td className="py-4">{student.semester ?? "—"}</td></tr>)}</tbody></table></div>}
          </section>
        </>
      )}
    </main>
  );
}

export default function MentorDashboardPage() {
  return <ProtectedRoute role="MENTOR"><AppFrame><MentorDashboardContent /></AppFrame></ProtectedRoute>;
}
