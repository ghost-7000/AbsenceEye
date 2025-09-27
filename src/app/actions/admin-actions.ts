'use server'

import dbConnect from "@/lib/mongodb";
import { AttendanceRecordModel, StudentModel, ClassModel, UserModel } from "@/lib/models";
import type { Student, User, AttendanceRecord, Class } from "@/lib/types";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

interface AbsentStudent extends Student {
  absences: number;
  className: string;
}

export async function getMostAbsentStudents(): Promise<AbsentStudent[]> {
    await dbConnect();

    const absenceCounts = await AttendanceRecordModel.aggregate([
        { $match: { status: 'absent' } },
        { $group: { _id: '$studentId', absences: { $sum: 1 } } },
        { $sort: { absences: -1 } },
        { $limit: 5 }
    ]);
    
    if (absenceCounts.length === 0) return [];
    
    const studentIds = absenceCounts.map(item => item._id);
    const students = await StudentModel.find({ _id: { $in: studentIds } }).lean();
    if (students.length === 0) return [];

    const classIds = [...new Set(students.map(student => student.classId))];
    const classes = await ClassModel.find({ _id: { $in: classIds } }).lean();
    
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));
    const classMap = new Map(classes.map(c => [c._id.toString(), c]));
    const absenceMap = new Map(absenceCounts.map(item => [item._id.toString(), item.absences]));

    const mostAbsent = studentIds.map(studentId => {
        const student = studentMap.get(studentId.toString());
        if (!student) return null;

        const studentClass = classMap.get(student.classId.toString());

        return {
            ...student,
            id: student._id.toString(),
            _id: student._id,
            absences: absenceMap.get(studentId.toString()) || 0,
            className: studentClass?.name || 'غير معروف',
        };
    }).filter((s): s is AbsentStudent => s !== null)
      .sort((a, b) => b.absences - a.absences);

    return JSON.parse(JSON.stringify(mostAbsent));
}


export async function getTeachers(): Promise<User[]> {
    await dbConnect();
    const teachers = await UserModel.find({ role: 'teacher' }).lean();
    return JSON.parse(JSON.stringify(teachers.map(t => ({...t, id: t._id.toString()}))));
}

export async function addTeacher(name: string, email: string, password: string, subject: string) {
    await dbConnect();
    const newTeacher = new UserModel({
        name,
        email,
        password: password, // In a real app, you would hash this
        role: 'teacher',
        subject,
        avatarUrl: ''
    });
    await newTeacher.save();
    revalidatePath('/admin/teachers');
    revalidatePath('/admin/dashboard');
}

export async function updateTeacher(teacherId: string, name: string, email: string, subject: string) {
    await dbConnect();
    await UserModel.findByIdAndUpdate(teacherId, { name, email, subject });
    revalidatePath('/admin/teachers');
}

export async function deleteTeacher(teacherId: string) {
    await dbConnect();
    await UserModel.findByIdAndDelete(teacherId);
    revalidatePath('/admin/teachers');
    revalidatePath('/admin/dashboard');
}

export async function getAdminStats() {
    await dbConnect();
    const [totalTeachers, totalClasses, totalStudents] = await Promise.all([
      UserModel.countDocuments({ role: 'teacher' }),
      ClassModel.countDocuments(),
      StudentModel.countDocuments()
    ]);
    return { totalTeachers, totalClasses, totalStudents };
}

export interface DetailedAttendanceRecord extends AttendanceRecord {
    studentName: string;
    className: string;
    subject?: string;
}

export async function getDetailedAttendanceRecords(): Promise<DetailedAttendanceRecord[]> {
    await dbConnect();

    const records: AttendanceRecord[] = await AttendanceRecordModel.find().sort({ date: -1, timestamp: -1 }).limit(200).lean();
    if (records.length === 0) return [];
    
    const studentIds = [...new Set(records.map(r => r.studentId))];
    const classIds = [...new Set(records.map(r => r.classId))];

    const students = await StudentModel.find({ _id: { $in: studentIds } }).lean();
    const classes = await ClassModel.find({ _id: { $in: classIds } }).lean();

    const studentMap = new Map(students.map(s => [s._id.toString(), s.name]));
    const classMap = new Map(classes.map(c => [c._id.toString(), { name: c.name, subject: c.subject }]));

    const detailedRecords = records.map(record => {
        const studentName = studentMap.get(record.studentId.toString());
        const classInfo = classMap.get(record.classId.toString());

        if (studentName && classInfo) {
            return {
                ...record,
                id: record._id.toString(),
                studentName: studentName,
                className: classInfo.name,
                subject: classInfo.subject,
            };
        }
        return null;
    }).filter((r): r is DetailedAttendanceRecord => r !== null);
    
    return JSON.parse(JSON.stringify(detailedRecords));
}

export interface ClassWithStudentCount extends Class {
    studentCount: number;
    teacherName: string;
}

export async function getClassesWithStudentCounts(): Promise<ClassWithStudentCount[]> {
    await dbConnect();
    
    const classes = await ClassModel.find().lean();
    if (classes.length === 0) return [];

    const validTeacherIds = [...new Set(classes.map(c => c.teacherId))]
      .filter(id => mongoose.Types.ObjectId.isValid(id));
      
    const teachers = validTeacherIds.length > 0
        ? await UserModel.find({ _id: { $in: validTeacherIds } }).lean()
        : [];
        
    const teacherMap = new Map(teachers.map(t => [t._id.toString(), t.name]));

    const result: ClassWithStudentCount[] = [];

    for (const cls of classes) {
        const studentCount = await StudentModel.countDocuments({ classId: cls._id.toString() });
        result.push({
            ...cls,
            id: cls._id.toString(),
            studentCount,
            teacherName: teacherMap.get(cls.teacherId) || 'غير معين',
        });
    }

    return JSON.parse(JSON.stringify(result));
}
