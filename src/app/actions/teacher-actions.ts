'use server'

import dbConnect from "@/lib/mongodb";
import { ClassModel, StudentModel, AttendanceRecordModel, UserModel } from "@/lib/models";
import type { Class, Student, User, AttendanceRecord, AttendanceStatus } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import type { DetailedAttendanceRecord as AdminDetailedAttendanceRecord } from "./admin-actions";

export type DetailedAttendanceRecord = AdminDetailedAttendanceRecord;

// This is a helper type for the client component
export type ClassWithStudents = Omit<Class, '_id'|'teacherId'> & { id: string; teacherId: string; students: (Omit<Student, '_id'|'classId'> & { id: string; classId: string; })[] };

export async function getTeacherData(teacherId: string): Promise<User> {
    await dbConnect();
    const user = await UserModel.findById(teacherId).lean();
    if (!user) throw new Error('Teacher not found');
    const { _id, ...userWithoutId } = user;
    return { ...userWithoutId, id: _id.toString() };
}

export async function getTeacherClassesAndStudents(teacherId: string): Promise<ClassWithStudents[]> {
    await dbConnect();
    const classes: Class[] = await ClassModel.find({ teacherId }).lean();
    
    const classesWithStudents: ClassWithStudents[] = [];

    for (const cls of classes) {
        const students: Student[] = await StudentModel.find({ classId: cls._id.toString() }).sort({ name: 1 }).lean();
        classesWithStudents.push({
            id: cls._id.toString(),
            name: cls.name,
            teacherId: cls.teacherId.toString(),
            subject: cls.subject,
            note: cls.note,
            students: students.map(s => ({
                id: s._id.toString(),
                name: s.name,
                avatarUrl: s.avatarUrl,
                classId: s.classId.toString(),
            })),
        });
    }
    
    return classesWithStudents;
}

export async function addClass(name: string, subject: string, teacherId: string) {
    await dbConnect();
    const newClass = new ClassModel({ name, subject, teacherId });
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
    const timestamp = new Date();

    const operations = records.map(record => ({
        updateOne: {
            filter: { studentId: record.studentId, classId: record.classId, date: date },
            update: { $set: { status: record.status, studentId: record.studentId, classId: record.classId, date, timestamp } },
            upsert: true,
        }
    }));

    if (operations.length > 0) {
        await AttendanceRecordModel.bulkWrite(operations);
    }
    revalidatePath('/teacher/attendance');
    revalidatePath('/teacher/dashboard');
    revalidatePath('/teacher/records');
    revalidatePath('/admin/attendance-records');
    revalidatePath('/admin/dashboard');

}

export async function getAttendanceForDate(teacherId: string, date: string): Promise<Omit<AttendanceRecord, '_id'|'studentId'|'classId'|'timestamp'> & {id: string, studentId:string, classId:string, timestamp: string}[]> {
    await dbConnect();
    const teacherClasses = await ClassModel.find({ teacherId }).select('_id');
    const classIds = teacherClasses.map(c => c._id.toString());
    
    const attendance: AttendanceRecord[] = await AttendanceRecordModel.find({ 
        classId: { $in: classIds },
        date: date 
    }).lean();

    return attendance.map(rec => ({
        id: rec._id.toString(),
        studentId: rec.studentId.toString(),
        classId: rec.classId.toString(),
        date: rec.date,
        status: rec.status,
        timestamp: rec.timestamp ? rec.timestamp.toISOString() : new Date(rec.date).toISOString(),
    }));
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

    const teacherClasses: Class[] = await ClassModel.find({ teacherId }).lean();
    if (teacherClasses.length === 0) return [];

    const classIds = teacherClasses.map(c => c._id.toString());

    const records: AttendanceRecord[] = await AttendanceRecordModel.find({ classId: { $in: classIds } }).sort({ date: -1, timestamp: -1 }).lean();
    if (records.length === 0) return [];
    
    const studentIds = records.map(r => r.studentId);
    
    const students: Student[] = await StudentModel.find({ _id: { $in: studentIds } }).lean();
    
    const studentMap = new Map(students.map(s => [s._id.toString(), s.name]));
    const classMap = new Map(teacherClasses.map(c => [c._id.toString(), {name: c.name, subject: c.subject}]));

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
