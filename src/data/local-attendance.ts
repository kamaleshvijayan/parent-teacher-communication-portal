export const ATTENDANCE_KEY = 'face-attendance-records';
export const FACE_PROFILES_KEY = 'face-attendance-profiles';
export const ATTENDANCE_UPDATED_EVENT = 'face-attendance-updated';

export function getTodayPresentIds(): string[] {
  try {
    const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}');
    return records[new Date().toISOString().slice(0, 10)] || [];
  } catch {
    return [];
  }
}

export function getAttendanceRecords(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getStudentAttendanceStats(studentId: string) {
  const records = getAttendanceRecords();
  const totalDays = Object.keys(records).length;
  const presentDays = Object.values(records).filter(ids => ids.includes(studentId)).length;
  return { totalDays, presentDays, absentDays: Math.max(0, totalDays - presentDays) };
}
