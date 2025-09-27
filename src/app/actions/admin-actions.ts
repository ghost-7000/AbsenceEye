'use server'

import dbConnect from "@/lib/mongodb";
import { AttendanceRecordModel, StudentModel, ClassModel, UserModel, TeacherModel } from "@/lib/models";
import type { Student, Teacher, AttendanceRecord, Class } from "@/lib/types";
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
    const students: Student[] = await StudentModel.find({ _id: { $in: studentIds } }).lean();
    if (students.length === 0) return [];

    const classIds = [...new Set(students.map(student => student.classId))];
    const classes: Class[] = await ClassModel.find({ _id: { $in: classIds } }).lean();
    
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
            _id: student._id.toString(),
            absences: absenceMap.get(studentId.toString()) || 0,
            className: studentClass?.name || 'غير معروف',
        };
    }).filter((s): s is AbsentStudent => s !== null)
      .sort((a, b) => b.absences - a.absences);

    return mostAbsent.map(s => ({
        ...s,
        classId: s.classId.toString(),
    }));
}


export async function getTeachers(): Promise<Teacher[]> {
    await dbConnect();
    const teachers: Teacher[] = await TeacherModel.find({}).lean();
    return teachers.map(t => ({
        ...t, 
        id: t._id.toString(),
        _id: t._id.toString(),
        subject: t.subject || 'غير محدد'
    }));
}

export async function addTeacher(data: { name: string, email: string, password: string, subject: string }) {
    await dbConnect();
    const { name, email, password, subject } = data;
    const newTeacher = new TeacherModel({
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

export async function updateTeacher(teacherId: string, data: { name: string, email: string, subject: string }) {
    await dbConnect();
    await TeacherModel.findByIdAndUpdate(teacherId, data);
    revalidatePath('/admin/teachers');
}

export async function deleteTeacher(teacherId: string) {
    await dbConnect();
    await TeacherModel.findByIdAndDelete(teacherId);
    revalidatePath('/admin/teachers');
    revalidatePath('/admin/dashboard');
}

export async function getAdminStats() {
    await dbConnect();
    const [totalTeachers, totalClasses, totalStudents] = await Promise.all([
      TeacherModel.countDocuments(),
      ClassModel.countDocuments(),
      StudentModel.countDocuments()
    ]);
    return { totalTeachers, totalClasses, totalStudents };
}

export interface DetailedAttendanceRecord {
    id: string;
    studentId: string;
    classId: string;
    date: string;
    status: 'present' | 'absent';
    timestamp: string;
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

    const students: Student[] = await StudentModel.find({ _id: { $in: studentIds } }).lean();
    const classes: Class[] = await ClassModel.find({ _id: { $in: classIds } }).lean();

    const studentMap = new Map(students.map(s => [s._id.toString(), s.name]));
    const classMap = new Map(classes.map(c => [c._id.toString(), { name: c.name, subject: c.subject }]));

    const detailedRecords = records.map(record => {
        const studentName = studentMap.get(record.studentId.toString());
        const classInfo = classMap.get(record.classId.toString());

        if (studentName && classInfo) {
            return {
                id: record._id.toString(),
                studentId: record.studentId.toString(),
                classId: record.classId.toString(),
                date: record.date,
                status: record.status,
                timestamp: record.timestamp ? record.timestamp.toISOString() : new Date(record.date).toISOString(),
                studentName: studentName,
                className: classInfo.name,
                subject: classInfo.subject,
            };
        }
        return null;
    }).filter((r): r is DetailedAttendanceRecord => r !== null);
    
    return detailedRecords;
}

export interface ClassWithStudentCount extends Omit<Class, '_id' | 'teacherId'> {
    id: string;
    teacherId: string;
    studentCount: number;
    teacherName: string;
}

export async function getClassesWithStudentCounts(): Promise<ClassWithStudentCount[]> {
    await dbConnect();
    
    const classes: Class[] = await ClassModel.find().lean();
    if (classes.length === 0) return [];

    const validTeacherIds = [...new Set(classes.map(c => c.teacherId))]
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));
      
    const teachers: Teacher[] = validTeacherIds.length > 0
        ? await TeacherModel.find({ _id: { $in: validTeacherIds } }).lean()
        : [];
        
    const teacherMap = new Map(teachers.map(t => [t._id.toString(), t.name]));

    const result: ClassWithStudentCount[] = [];
    for (const cls of classes) {
        const studentCount = await StudentModel.countDocuments({ classId: cls._id.toString() });
        const teacherName = teacherMap.get(cls.teacherId.toString()) || 'غير معين';
        
        result.push({
            id: cls._id.toString(),
            name: cls.name,
            teacherId: cls.teacherId.toString(),
            subject: cls.subject,
            note: cls.note,
            studentCount,
            teacherName,
        });
    }

    return result;
}
