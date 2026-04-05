export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin';
  avatarUrl: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'teacher';
  avatarUrl: string;
  subject: string;
};

export type Class = {
  id: string;
  name: string;
  teacherId: string;
  subject?: string;
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
  date: string;
  status: AttendanceStatus;
  timestamp: Date | string;
};
