import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { User, Class, Student, AttendanceRecord } from './types';

const UserSchema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'teacher'], required: true },
    avatarUrl: { type: String },
});

const ClassSchema = new Schema<Class>({
    name: { type: String, required: true },
    teacherId: { type: String, required: true },
    note: { type: String },
});

const StudentSchema = new Schema<Student>({
    name: { type: String, required: true },
    classId: { type: String, required: true },
    avatarUrl: { type: String },
});

const AttendanceRecordSchema = new Schema<AttendanceRecord>({
    studentId: { type: String, required: true },
    classId: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
});


export const UserModel = models.User || model<User>('User', UserSchema);
export const ClassModel = models.Class || model<Class>('Class', ClassSchema);
export const StudentModel = models.Student || model<Student>('Student', StudentSchema);
export const AttendanceRecordModel = models.AttendanceRecord || model<AttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
