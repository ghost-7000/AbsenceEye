'use server'

import dbConnect from "@/lib/mongodb";
import { AttendanceRecordModel, StudentModel, ClassModel } from "@/lib/models";
import type { Student } from "@/lib/types";

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
        const student = studentMap.get(studentId);
        if (!student) return null;

        const studentClass = classMap.get(student.classId);

        return {
            ...student,
            id: student._id.toString(),
            absences: absenceMap.get(studentId) || 0,
            className: studentClass?.name || 'غير معروف',
        };
    }).filter((s): s is AbsentStudent => s !== null);

    return mostAbsent;
}
