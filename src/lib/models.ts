import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { User, Teacher, Class, Student, AttendanceRecord } from './types';

// Schema for Admins, stored in 'users' collection
const UserSchema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin', required: true },
    avatarUrl: { type: String },
});

// Schema for Teachers, stored in 'teachers' collection
const TeacherSchema = new Schema<Teacher>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['teacher'], default: 'teacher', required: true },
    subject: { type: String, required: true },
    avatarUrl: { type: String },
});


const ClassSchema = new Schema<Class>({
    name: { type: String, required: true },
    teacherId: { type: String, required: true }, // Refers to Teacher _id
    subject: { type: String },
    note: { type: String },
});

const StudentSchema = new Schema<Student>({
    name: { type: String, required: true },
    classId: { type: String, required: true }, // Refers to Class _id
    avatarUrl: { type: String },
});

const AttendanceRecordSchema = new Schema<AttendanceRecord>({
    studentId: { type: String, required: true },
    classId: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    status: { type: String, enum: ['present', 'absent'], required: true },
    timestamp: { type: Date, default: Date.now },
});

// Index for faster queries on attendance
AttendanceRecordSchema.index({ studentId: 1, classId: 1, date: 1 });
AttendanceRecordSchema.index({ classId: 1, date: 1 });
AttendanceRecordSchema.index({ date: 1 });


export const UserModel = models.User || model<User>('User', UserSchema);
export const TeacherModel = models.Teacher || model<Teacher>('Teacher', TeacherSchema);
export const ClassModel = models.Class || model<Class>('Class', ClassSchema);
export const StudentModel = models.Student || model<Student>('Student', StudentSchema);
export const AttendanceRecordModel = models.AttendanceRecord || model<AttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
