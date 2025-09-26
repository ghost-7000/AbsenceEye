'use server'

import dbConnect from "@/lib/mongodb";
import { ClassModel, StudentModel, AttendanceRecordModel } from "@/lib/models";
import type { Class, Student } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

// This is a helper type for the client component
export type ClassWithStudents = Class & { students: Student[] };

export async function getTeacherClassesAndStudents(teacherId: string): Promise<ClassWithStudents[]> {
    await dbConnect();
    const classes = await ClassModel.find({ teacherId }).lean();
    
    const classesWithStudents: ClassWithStudents[] = [];

    for (const cls of classes) {
        const students = await StudentModel.find({ classId: cls._id.toString() }).lean();
        classesWithStudents.push({
            ...cls,
            id: cls._id.toString(),
            students: students.map(s => ({...s, id: s._id.toString()})),
        });
    }
    
    return classesWithStudents;
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
            filter: { studentId: record.studentId, date: date },
            update: { $set: { ...record, date } },
            upsert: true,
        }
    }));

    if (operations.length > 0) {
        await AttendanceRecordModel.bulkWrite(operations);
    }
    revalidatePath('/teacher/attendance');
}
