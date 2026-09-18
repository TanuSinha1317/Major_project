export type AttendanceResult = "PRESENT" | "ABSENT";
export type VerificationStatus = "UNVERIFIED" | "VERIFIED";
export type AttendanceSubmissionType = "BASIC";

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
  todayAttendance: Attendance | null;
};
