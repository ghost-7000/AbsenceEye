import { Users, School, UserCheck, BarChart3, Users2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { getAdminStats, getClassesWithStudentCounts } from '@/app/actions/admin-actions';
import MostAbsentStudents from '@/components/dashboard/admin/most-absent-students';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboardPage() {
  const { totalTeachers, totalClasses, totalStudents } = await getAdminStats();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">لوحة التحكم الرئيسية</h1>
      </div>

      {/* Stats Cards */}
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
          description="عدد الصفوف الدراسية في النظام"
        />
        <StatsCard
          title="إجمالي الطلاب"
          value={totalStudents.toString()}
          icon={Users2}
          description="عدد الطلاب المسجلين في جميع الصفوف"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 gap-6">
        <MostAbsentStudents />
      </div>

       <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
           <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary" />
                        <CardTitle>إدارة المعلمات</CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                        عرض وتعديل وحذف بيانات المعلمات، وإضافة معلمات جدد إلى النظام.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/admin/teachers">
                        <Button variant="outline">الانتقال إلى صفحة المعلمات</Button>
                    </Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <School className="h-6 w-6 text-primary" />
                        <CardTitle>إدارة الصفوف</CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                        عرض الصفوف الدراسية، وتعيين المعلمات، وإدارة الطلاب في كل صف.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Link href="/admin/classes">
                        <Button variant="outline">الانتقال إلى صفحة الصفوف</Button>
                    </Link>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
