import TeacherDashboard from "@/components/dashboard/teacher/teacher-dashboard";
import dbConnect from "@/lib/mongodb";
import { ClassModel, StudentModel, AttendanceRecordModel } from "@/lib/models";
import { format } from 'date-fns';

async function getTeacherStats() {
    await dbConnect();
    // In a real app, you'd filter by the logged-in teacher's ID
    const teacherId = "user-2"; // Using a static ID for demonstration
    const classCount = await ClassModel.countDocuments({ teacherId: teacherId });
    
    const teacherClasses = await ClassModel.find({ teacherId: teacherId }).select('_id');
    const classIds = teacherClasses.map(c => c._id);

    const students = await StudentModel.find({ classId: { $in: classIds } }).select('_id');
    const studentCount = students.length;
    const studentIds = students.map(s => s._id.toString());

    let attendancePercentage = 0;
    if (studentCount > 0) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const presentCount = await AttendanceRecordModel.countDocuments({
            studentId: { $in: studentIds },
            date: today,
            status: 'present'
        });
        attendancePercentage = Math.round((presentCount / studentCount) * 100);
    }

    return { classCount, studentCount, attendancePercentage };
}


export default async function TeacherDashboardPage() {
    const { classCount, studentCount, attendancePercentage } = await getTeacherStats();
    return <TeacherDashboard classCount={classCount} studentCount={studentCount} attendancePercentage={attendancePercentage} />;
}
