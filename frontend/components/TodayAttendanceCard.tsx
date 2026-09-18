"use client";

import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { api, ApiError } from "@/lib/api";
import { Attendance, AttendancePolicy, HybridSchedule, TodayAttendance } from "@/lib/attendance";

type LiveLocation = { latitude: number; longitude: number; accuracy: number };

function attendanceLabel(attendance: Attendance) {
  if (attendance.attendanceResult !== "PRESENT") return "Absent";
  return attendance.verificationStatus === "VERIFIED" ? "Present — automatically verified" : "Present — verification unavailable";
}

export function TodayAttendanceCard() {
  const [today, setToday] = useState<TodayAttendance | null>(null);
  const [policy, setPolicy] = useState<AttendancePolicy | null>(null);
  const [schedule, setSchedule] = useState<HybridSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
  const [dailyWorkSummary, setDailyWorkSummary] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<TodayAttendance>("/student/attendance/today"),
      api.get<AttendancePolicy>("/student/attendance/today/policy")
    ]).then(([attendanceResponse, policyResponse]) => {
      setToday(attendanceResponse.data); setPolicy(policyResponse.data);
      if (policyResponse.data.internshipMode === "HYBRID") {
        void api.get<HybridSchedule>("/student/internship/hybrid-schedule")
          .then(response => setSchedule(response.data)).catch(() => setSchedule(null));
      }
    })
      .catch(() => setError("Today's attendance status could not be loaded."))
      .finally(() => setLoading(false));
    return () => { streamRef.current?.getTracks().forEach(track => track.stop()); };
  }, []);

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!flowOpen || photo || !video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => setError("The camera preview could not be started."));
  }, [flowOpen, photo, cameraStatus]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    stopCamera(); setError(""); setFlowOpen(true); setPhoto(null); setLiveLocation(null);
    setCameraStatus("Requesting camera permission…"); setLocationStatus("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus(""); setError("Camera access is unavailable. Open the application at http://localhost:3000 in a supported browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraStatus("Camera ready");
    } catch (cause) {
      setCameraStatus("");
      const name = cause instanceof DOMException ? cause.name : "";
      setError(name === "NotAllowedError"
        ? "Camera access is required to verify attendance. Please allow camera access in your browser settings."
        : "The camera is unavailable. Check that a camera is connected and not in use by another application.");
    }
  }

  function acquireLocation() {
    setLocationStatus("Requesting current location…"); setLiveLocation(null);
    if (!navigator.geolocation) { setLocationStatus("Location unavailable"); return; }
    navigator.geolocation.getCurrentPosition(position => {
      setLiveLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
      setLocationStatus("Location acquired");
    }, () => setLocationStatus("Location unavailable — attendance can still be submitted"), {
      enableHighAccuracy: true, timeout: 12_000, maximumAge: 0
    });
  }

  async function capture() {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) { setError("The camera is not ready yet."); return; }
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const captured = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!captured) { setError("The camera image could not be captured."); return; }
    stopCamera();
    setPhoto(captured); setPhotoUrl(URL.createObjectURL(captured)); setCameraStatus("Photo captured");
    if (policy?.verificationMethod === "PHYSICAL") acquireLocation();
  }

  async function submitBasic() {
    if (policy?.verificationMethod !== "BASIC" && policy?.verificationMethod !== "UNAVAILABLE") {
      setError("Use today's required attendance evidence flow.");
      return;
    }
    setSubmitting(true); setError("");
    try {
      const { data } = await api.post<Attendance>("/student/attendance/today");
      setToday({ attendanceDate: data.attendanceDate, attendance: data });
      stopCamera(); setFlowOpen(false);
    } catch (cause) {
      setError((cause as AxiosError<ApiError>).response?.data?.message ?? "Attendance could not be submitted.");
    } finally { setSubmitting(false); }
  }

  async function submitPhysical() {
    if (!photo) return;
    setSubmitting(true); setError("");
    const form = new FormData();
    form.append("photo", photo, "attendance-capture.jpg");
    if (liveLocation) {
      form.append("latitude", String(liveLocation.latitude));
      form.append("longitude", String(liveLocation.longitude));
      form.append("accuracy", String(liveLocation.accuracy));
    }
    try {
      const { data } = await api.post<Attendance>("/student/attendance/today/physical", form,
        { headers: { "Content-Type": "multipart/form-data" } });
      setToday({ attendanceDate: data.attendanceDate, attendance: data }); setFlowOpen(false);
    } catch (cause) {
      setError((cause as AxiosError<ApiError>).response?.data?.message ?? "Attendance could not be submitted.");
    } finally { setSubmitting(false); }
  }

  async function submitRemote() {
    if (!photo) return;
    const summary = dailyWorkSummary.trim();
    if (summary.length < 20 || summary.length > 1000) {
      setError("Daily work summary must contain between 20 and 1000 characters."); return;
    }
    setSubmitting(true); setError("");
    const form = new FormData();
    form.append("photo", photo, "attendance-capture.jpg");
    form.append("dailyWorkSummary", summary);
    try {
      const { data } = await api.post<Attendance>("/student/attendance/today/remote", form,
        { headers: { "Content-Type": "multipart/form-data" } });
      setToday({ attendanceDate: data.attendanceDate, attendance: data }); setFlowOpen(false);
    } catch (cause) {
      setError((cause as AxiosError<ApiError>).response?.data?.message ?? "Attendance could not be submitted.");
    } finally { setSubmitting(false); }
  }

  const attendance = today?.attendance;
  const physical = policy?.verificationMethod === "PHYSICAL";
  const remote = policy?.verificationMethod === "REMOTE";
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Today&apos;s Attendance</p><h2 className="mt-3 text-xl font-bold">{loading ? "Checking attendance…" : attendance ? attendanceLabel(attendance) : "Not submitted"}</h2></div>
        {attendance && <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${attendance.verificationStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{attendance.verificationStatus === "VERIFIED" ? "Verified" : "Unverified"}</span>}
      </div>
      {!loading && attendance ? <p className="mt-3 text-sm text-slate-600">Submitted at {new Date(attendance.serverSubmittedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} using server time.</p> : !loading && <p className="mt-3 text-sm text-slate-600">Attendance can be submitted once today during your registered internship period.</p>}
      {!loading && policy?.todayWorkMode && <p className="mt-3 text-sm font-semibold text-slate-700">Today&apos;s expected work mode: {policy.todayWorkMode === "OFFICE" ? "Office" : "Remote"}</p>}
      {!loading && policy?.internshipMode === "HYBRID" && schedule && <div className="mt-4 flex flex-wrap gap-2">{schedule.entries.map(entry => <span key={entry.dayOfWeek} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-700">{entry.dayOfWeek.slice(0, 3)} · {entry.workMode === "OFFICE" ? "Office" : "Remote"}</span>)}</div>}
      {!loading && !attendance && !policy && <p role="alert" className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">Today&apos;s attendance policy could not be confirmed. Reload the dashboard before submitting attendance.</p>}
      {!loading && !attendance && policy && !policy.configurationReady && <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">Today&apos;s work mode has not been configured. Attendance can be submitted but cannot be automatically verified.</p>}
      {!loading && !attendance && policy && !flowOpen && <button type="button" disabled={submitting} onClick={() => { if (physical || remote) void startCamera(); else void submitBasic(); }} className="mt-6 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "Submitting…" : policy.verificationMethod === "UNAVAILABLE" ? "Submit Unverified Attendance" : "Mark Today's Attendance"}</button>}
      {!loading && !attendance && flowOpen && <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        {!photo ? <video ref={videoRef} playsInline muted className="aspect-video w-full max-w-xl rounded-xl bg-slate-950 object-cover" /> : <img src={photoUrl} alt="Fresh attendance camera capture" className="aspect-video w-full max-w-xl rounded-xl bg-slate-950 object-cover" />}
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-4 flex flex-wrap gap-3 text-sm"><span className={cameraStatus ? "font-semibold text-emerald-700" : "text-slate-500"}>{cameraStatus || "Camera unavailable"}</span>{locationStatus && <span className={liveLocation ? "font-semibold text-emerald-700" : "text-amber-700"}>{locationStatus}</span>}</div>
        <div className="mt-4 flex flex-wrap gap-3">
          {!photo && streamRef.current && <button type="button" onClick={() => void capture()} className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white">Capture</button>}
          {photo && remote && <label className="w-full max-w-xl text-sm font-semibold text-slate-700">Today&apos;s work/activity<textarea value={dailyWorkSummary} onChange={event => setDailyWorkSummary(event.target.value)} minLength={20} maxLength={1000} rows={4} placeholder="Describe the work you completed today (20–1000 characters)." className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal"/><span className="mt-1 block text-xs font-normal text-slate-500">{dailyWorkSummary.trim().length} / 1000 characters</span></label>}
          {photo && <><button type="button" disabled={submitting || (remote && dailyWorkSummary.trim().length < 20)} onClick={() => void (remote ? submitRemote() : submitPhysical())} className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "Submitting…" : "Submit Attendance"}</button><button type="button" disabled={submitting} onClick={() => void startCamera()} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold">Retake</button></>}
          <button type="button" onClick={() => { stopCamera(); setFlowOpen(false); setError(""); }} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
        </div>
      </div>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
