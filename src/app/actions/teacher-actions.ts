'use server'

import dbConnect from "@/lib/mongodb";
import { ClassModel, StudentModel, AttendanceRecordModel, UserModel } from "@/lib/models";
import type { Class, Student, User } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

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
    // For demo, generating a random avatar
    const randomSeed = Math.floor(Math.random() * 1000);
    const avatarUrl = `https://picsum.photos/seed/${randomSeed}/200/200`;
    const newStudent = new StudentModel({ name, classId, avatarUrl });
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
            filter: { studentId: record.studentId, date: date },
            update: { $set: { ...record, date } },
            upsert: true,
        }
    }));

    if (operations.length > 0) {
        await AttendanceRecordModel.bulkWrite(operations);
    }
    revalidatePath('/teacher/attendance');
    revalidatePath('/teacher/dashboard');
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
