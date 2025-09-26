export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  avatarUrl: string;
};

export type Class = {
  id: string;
  name: string;
  teacherId: string;
  note?: string;
};

export type Student = {
  id: string;
  name: string;
  classId: string;
  avatarUrl: string;
};

export type AttendanceStatus = 'present' | 'absent';

export type AttendanceRecord = {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
};
