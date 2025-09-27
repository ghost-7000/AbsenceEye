import type { Types } from 'mongoose';

export type User = {
  _id: Types.ObjectId;
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'teacher';
  avatarUrl: string;
  subject?: string;
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
