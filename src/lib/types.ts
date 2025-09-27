import type { Types } from 'mongoose';

// A unified User type for both Admins and Teachers
export type User = {
  _id: Types.ObjectId;
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'teacher';
  avatarUrl: string;
  subject?: string; // Subject is optional, mainly for teachers
};

// Teacher is now an alias for User with role 'teacher'
export type Teacher = User & {
  role: 'teacher';
};

export type Class = {
  _id: Types.ObjectId;
  id: string;
  name: string;
  teacherId: string;
  subject?: string;
  note?: string;
};

export type Student = {
  _id: Types.ObjectId;
  id: string;
  name: string;
  classId: string;
  avatarUrl: string;
};

export type AttendanceStatus = 'present' | 'absent';

export type AttendanceRecord = {
  _id: Types.ObjectId;
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  timestamp: Date;
};
