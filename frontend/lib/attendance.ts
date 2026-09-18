export type AttendanceResult = "PRESENT" | "ABSENT";
export type VerificationStatus = "UNVERIFIED" | "VERIFIED";
export type AttendanceSubmissionType = "BASIC" | "PHYSICAL_CAPTURE" | "REMOTE_CAPTURE";

export type Attendance = {
  id: number;
  internshipId: number;
  attendanceDate: string;
  attendanceResult: AttendanceResult;
  verificationStatus: VerificationStatus;
  submissionType: AttendanceSubmissionType;
  serverSubmittedAt: string;
};

export type TodayAttendance = {
  attendanceDate: string;
  attendance: Attendance | null;
};

export type MentorStudentAttendance = {
  studentUserId: number;
  name: string | null;
  uid: string | null;
  branchLabel: string | null;
  semester: number | null;
  companyName: string | null;
  internshipMode: string | null;
  internshipModeLabel: string | null;
  todayWorkMode: HybridWorkMode | null;
  todayAttendance: Attendance | null;
};

export type HybridWorkMode = "OFFICE" | "REMOTE";
export type AttendanceVerificationMethod = "PHYSICAL" | "REMOTE" | "BASIC" | "UNAVAILABLE";

export type AttendancePolicy = {
  internshipMode: "OFFICE_REPORTING" | "HYBRID" | "ONLINE" | "COLLEGE_REPORTING";
  todayWorkMode: HybridWorkMode | null;
  verificationMethod: AttendanceVerificationMethod;
  attendanceAlreadySubmitted: boolean;
  configurationReady: boolean;
  serverDate: string;
};

export type HybridScheduleEntry = { dayOfWeek: string; workMode: HybridWorkMode };
export type HybridSchedule = { internshipId: number; entries: HybridScheduleEntry[] };

export type InternshipLocationStatus = "PENDING" | "CONFIRMED";

export type InternshipLocation = {
  id: number;
  internshipId: number;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  status: InternshipLocationStatus;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  confirmedBy: number | null;
};
