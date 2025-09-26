import { Users, School, UserCheck } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { AttendanceSummary } from '@/components/dashboard/admin/attendance-summary';
import TeacherManagement from '@/components/dashboard/admin/teacher-management';
import MostAbsentStudents from './most-absent-students';
import { getAdminStats } from '@/app/actions/admin-actions';


export default async function AdminDashboard() {
  const { totalTeachers, totalClasses, totalStudents } = await getAdminStats();

  return (
    <div className="grid gap-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">لوحة التحكم الرئيسية</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="إجمالي المعلمات"
          value={totalTeachers.toString()}
          icon={Users}
          description="عدد المعلمات المسجلات في النظام"
        />
        <StatsCard
          title="إجمالي الصفوف"
          value={totalClasses.toString()}
          icon={School}
          description="عدد الصفوف الدراسية"
        />
        <StatsCard
          title="إجمالي الطلاب"
          value={totalStudents.toString()}
          icon={UserCheck}
          description="عدد الطلاب المسجلين"
        />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-5">
         <div className="lg:col-span-3">
            <AttendanceSummary />
         </div>
         <div className="lg:col-span-2">
            <MostAbsentStudents />
         </div>
      </div>

      <div>
        <TeacherManagement />
      </div>
    </div>
  );
}
