'use server'

import dbConnect from "@/lib/mongodb";
import { ClassModel, StudentModel, AttendanceRecordModel, UserModel } from "@/lib/models";
import type { Class, Student, User, AttendanceRecord } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import type { DetailedAttendanceRecord } from "./admin-actions";

// This is a helper type for the client component
export type ClassWithStudents = Class & { students: Student[] };

export async function getTeacherData(teacherId: string) {
    const user = await UserModel.findById(teacherId).lean();
    if (!user) throw new Error('Teacher not found');
    return JSON.parse(JSON.stringify(user)) as User;
}

export async function getTeacherClassesAndStudents(teacherId: string): Promise<ClassWithStudents[]> {
    await dbConnect();
    const classes = await ClassModel.find({ teacherId }).lean();
    
    const classesWithStudents: ClassWithStudents[] = [];

    for (const cls of classes) {
        const students = await StudentModel.find({ classId: cls._id.toString() }).sort({ name: 1 }).lean();
        classesWithStudents.push({
            ...cls,
            id: cls._id.toString(),
            students: students.map(s => ({...s, id: s._id.toString()})),
        });
    }
    
    return JSON.parse(JSON.stringify(classesWithStudents));
}

export async function addClass(name: string, teacherId: string) {
    await dbConnect();
    const newClass = new ClassModel({ name, teacherId });
    await newClass.save();
    revalidatePath('/teacher/classes');
}

export async function addStudent(name: string, classId: string) {
    await dbConnect();
    const newStudent = new StudentModel({ name, classId, avatarUrl: '' });
    await newStudent.save();
    revalidatePath('/teacher/classes');
}

export async function deleteStudent(studentId: string) {
    await dbConnect();
    await StudentModel.findByIdAndDelete(studentId);
    // Also delete any attendance records for this student
    await AttendanceRecordModel.deleteMany({ studentId });
    revalidatePath('/teacher/classes');
}

export async function updateClassName(classId: string, name: string) {
    await dbConnect();
    await ClassModel.findByIdAndUpdate(classId, { name });
    revalidatePath('/teacher/classes');
}

export async function updateClassNote(classId: string, note: string) {
    await dbConnect();
    await ClassModel.findByIdAndUpdate(classId, { note });
    revalidatePath('/teacher/classes');
}

type AttendanceData = {
    studentId: string;
    classId: string;
    status: 'present' | 'absent';
}

export async function saveAttendance(records: AttendanceData[]) {
    await dbConnect();
    const date = format(new Date(), 'yyyy-MM-dd');

    const operations = records.map(record => ({
        updateOne: {
            filter: { studentId: record.studentId, classId: record.classId, date: date },
            update: { $set: { status: record.status, studentId: record.studentId, classId: record.classId, date } },
            upsert: true,
        }
    }));

    if (operations.length > 0) {
        await AttendanceRecordModel.bulkWrite(operations);
    }
    revalidatePath('/teacher/attendance');
    revalidatePath('/teacher/dashboard');
    revalidatePath('/teacher/records');
}

export async function getAttendanceForDate(teacherId: string, date: string) {
    await dbConnect();
    const teacherClasses = await ClassModel.find({ teacherId }).select('_id');
    const classIds = teacherClasses.map(c => c._id.toString());
    
    const attendance = await AttendanceRecordModel.find({ 
        classId: { $in: classIds },
        date: date 
    }).lean();

    return JSON.parse(JSON.stringify(attendance));
}


export async function getTeacherStats(teacherId: string) {
    await dbConnect();
    
    const classCount = await ClassModel.countDocuments({ teacherId: teacherId });
    
    const teacherClasses = await ClassModel.find({ teacherId: teacherId }).select('_id');
    const classIds = teacherClasses.map(c => c._id);

    const studentCount = await StudentModel.countDocuments({ classId: { $in: classIds } });
    
    let attendancePercentage = 0;
    if (studentCount > 0) {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const presentCount = await AttendanceRecordModel.countDocuments({
            classId: { $in: classIds },
            date: today,
            status: 'present'
        });
        // Avoid division by zero if there are students but no attendance taken yet
        const totalTaken = await AttendanceRecordModel.countDocuments({
             classId: { $in: classIds },
             date: today,
        });

        if (totalTaken > 0) {
            attendancePercentage = Math.round((presentCount / totalTaken) * 100);
        }
    }

    return { classCount, studentCount, attendancePercentage };
}

export async function getDetailedAttendanceForTeacher(teacherId: string): Promise<DetailedAttendanceRecord[]> {
    await dbConnect();

    const teacherClasses = await ClassModel.find({ teacherId }).lean();
    const classIds = teacherClasses.map(c => c._id.toString());

    const records = await AttendanceRecordModel.find({ classId: { $in: classIds } }).sort({ date: -1 }).lean();
    const studentIds = records.map(r => r.studentId);
    
    const students = await StudentModel.find({ _id: { $in: studentIds } }).lean();
    
    const studentMap = new Map(students.map(s => [s._id.toString(), s.name]));
    const classMap = new Map(teacherClasses.map(c => [c._id.toString(), c.name]));

    const detailedRecords = records.map(record => ({
        ...record,
        id: record._id.toString(),
        studentName: studentMap.get(record.studentId.toString()) || 'طالب محذوف',
        className: classMap.get(record.classId.toString()) || 'صف محذوف',
    }));

    return JSON.parse(JSON.stringify(detailedRecords));
}
