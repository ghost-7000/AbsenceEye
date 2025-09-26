import TeacherDashboard from "@/components/dashboard/teacher/teacher-dashboard";
import dbConnect from "@/lib/mongodb";
import { ClassModel } from "@/lib/models";
import { StudentModel } from "@/lib/models";

async function getTeacherStats() {
    await dbConnect();
    // In a real app, you'd filter by the logged-in teacher's ID
    const teacherId = "user-2"; // Using a static ID for demonstration
    const classCount = await ClassModel.countDocuments({ teacherId: teacherId });
    
    const teacherClasses = await ClassModel.find({ teacherId: teacherId }).select('_id');
    const classIds = teacherClasses.map(c => c._id.toString());
    
    // Mongoose can't directly use string arrays with ObjectId fields in $in
    // So we find based on classId as string
    const studentCount = await StudentModel.countDocuments({ classId: { $in: classIds.map(id => id.toString()) } });

    return { classCount, studentCount };
}


export default async function TeacherDashboardPage() {
    const { classCount, studentCount } = await getTeacherStats();
    return <TeacherDashboard classCount={classCount} studentCount={studentCount} />;
}
