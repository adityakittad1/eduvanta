import { api } from '@/lib/api';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HOLIDAY';

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  remarks: string | null;
}

export interface StudentAttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  holidays: number;
  percentage: number;
}

export interface StudentAttendanceResponse {
  stats: StudentAttendanceStats;
  history: AttendanceRecord[];
}

export const attendanceApi = {
  markAttendance: async (classId: string, date: string, records: { studentId: string; status: AttendanceStatus; remarks?: string }[]) => {
    const { data } = await api.post<{ success: boolean; message: string }>('/attendance', {
      classId,
      date,
      records
    });
    return data.message;
  },

  getDailyAttendance: async (classId: string, date: string) => {
    const { data } = await api.get<{ success: boolean; data: AttendanceRecord[] }>(`/attendance?classId=${classId}&date=${date}`);
    return data.data;
  },

  getStudentAttendance: async (studentId: string) => {
    const { data } = await api.get<{ success: boolean; data: StudentAttendanceResponse }>(`/attendance/student/${studentId}`);
    return data.data;
  }
};
