'use server'

import dbConnect from "@/lib/mongodb";
import { AttendanceRecordModel, StudentModel, ClassModel, UserModel } from "@/lib/models";
import type { Student, User, AttendanceRecord, Class } from "@/lib/types";
import { revalidatePath } from "next/cache";

interface AbsentStudent extends Student {
  absences: number;
  className: string;
}

export async function getMostAbsentStudents(): Promise<AbsentStudent[]> {
    await dbConnect();

    // 1. Aggregate to get absence counts for each student
    const absenceCounts = await AttendanceRecordModel.aggregate([
        { $match: { status: 'absent' } },
        { $group: { _id: '$studentId', absences: { $sum: 1 } } },
        { $sort: { absences: -1 } },
        { $limit: 5 }
    ]);
    
    const studentIds = absenceCounts.map(item => item._id);

    // 2. Find student details for the top absent students
    const students = await StudentModel.find({ _id: { $in: studentIds } }).lean();

    // 3. Find class details for these students
    const classIds = students.map(student => student.classId);
    const classes = await ClassModel.find({ _id: { $in: classIds } }).lean();
    
    // 4. Create maps for easy lookup
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));
    const classMap = new Map(classes.map(c => [c._id.toString(), c]));
    const absenceMap = new Map(absenceCounts.map(item => [item._id.toString(), item.absences]));

    // 5. Combine the data
    const mostAbsent: AbsentStudent[] = studentIds.map(studentId => {
        const student = studentMap.get(studentId.toString());
        if (!student) return null;

        const studentClass = classMap.get(student.classId.toString());

        return {
            ...student,
            id: student._id.toString(),
            absences: absenceMap.get(studentId.toString()) || 0,
            className: studentClass?.name || 'غير معروف',
        };
    }).filter((s): s is AbsentStudent => s !== null)
      .sort((a, b) => b.absences - a.absences);

    // This is needed because the lean object doesn't have the id property
    return JSON.parse(JSON.stringify(mostAbsent));
}

export async function getTeachers(): Promise<User[]> {
    await dbConnect();
    const teachers = await UserModel.find({ role: 'teacher' }).lean();
    return JSON.parse(JSON.stringify(teachers));
}

export async function addTeacher(name: string, email: string) {
    await dbConnect();
    // In a real app, you would also set a default password and handle email verification
    const newTeacher = new UserModel({
        name,
        email,
        password: 'password123', // Demo password
        role: 'teacher',
        avatarUrl: ''
    });
    await newTeacher.save();
    revalidatePath('/admin/teachers');
    revalidatePath('/admin/dashboard');
}

export async function updateTeacher(teacherId: string, name: string, email: string) {
    await dbConnect();
    await UserModel.findByIdAndUpdate(teacherId, { name, email });
    revalidatePath('/admin/teachers');
}

export async function deleteTeacher(teacherId: string) {
    await dbConnect();
    await UserModel.findByIdAndDelete(teacherId);
    // Also need to handle re-assigning or deleting classes/students of this teacher if needed
    revalidatePath('/admin/teachers');
    revalidatePath('/admin/dashboard');
}

export async function getAdminStats() {
    await dbConnect();
    const totalTeachers = await UserModel.countDocuments({ role: 'teacher' });
    const totalClasses = await ClassModel.countDocuments();
    const totalStudents = await StudentModel.countDocuments();
    return { totalTeachers, totalClasses, totalStudents };
}

export interface DetailedAttendanceRecord extends AttendanceRecord {
    studentName: string;
    className: string;
}

export async function getDetailedAttendanceRecords(): Promise<DetailedAttendanceRecord[]> {
    await dbConnect();

    const records: AttendanceRecord[] = await AttendanceRecordModel.find().sort({ date: -1 }).lean();
    if (records.length === 0) return [];
    
    const studentIds = records.map(r => r.studentId);
    const classIds = [...new Set(records.map(r => r.classId))];

    const students = await StudentModel.find({ _id: { $in: studentIds } }).lean();
    const classes = await ClassModel.find({ _id: { $in: classIds } }).lean();

    const studentMap = new Map(students.map(s => [s._id.toString(), s.name]));
    const classMap = new Map(classes.map(c => [c._id.toString(), c.name]));

    const detailedRecords = records.map(record => {
        const studentName = studentMap.get(record.studentId.toString());
        const className = classMap.get(record.classId.toString());

        if (studentName && className) {
            return {
                ...record,
                id: record._id.toString(),
                studentName: studentName,
                className: className,
            };
        }
        return null;
    }).filter((r): r is DetailedAttendanceRecord => r !== null);
    
    return JSON.parse(JSON.stringify(detailedRecords));
}
