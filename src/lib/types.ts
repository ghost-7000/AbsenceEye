import type { Types } from 'mongoose';

// Type for Admins, stored in the 'users' collection
export type User = {
  _id: Types.ObjectId;
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin';
  avatarUrl: string;
};

// Type for Teachers, stored in the 'teachers' collection
export type Teacher = {
  _id: Types.ObjectId;
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'teacher';
  avatarUrl: string;
  subject: string;
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
