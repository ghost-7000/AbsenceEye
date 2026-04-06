'use client';

import { Users, School, Users2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { getAdminStats, getClassesWithStudentCounts } from '@/app/actions/admin-actions';
import MostAbsentStudents from '@/components/dashboard/admin/most-absent-students';
import DailySummary from '@/components/dashboard/admin/daily-summary';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboardPage() {
  const { totalTeachers, totalClasses, totalStudents } = await getAdminStats();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">
          {'لوحة التحكم الرئيسية'}
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="إجمالي المعلمات"
          titleEn="Total Teachers"
          value={totalTeachers.toString()}
          icon={Users}
          description="عدد المعلمات المسجلات في النظام"
          descriptionEn="Number of teachers registered in the system"
        />
        <StatsCard
          title="إجمالي الصفوف"
          titleEn="Total Classes"
          value={totalClasses.toString()}
          icon={School}
          description="عدد الصفوف الدراسية في النظام"
          descriptionEn="Number of classes in the system"
        />
        <StatsCard
          title="إجمالي الطلاب"
          titleEn="Total Students"
          value={totalStudents.toString()}
          icon={Users2}
          description="عدد الطلاب المسجلين في جميع الصفوف"
          descriptionEn="Total students enrolled across all classes"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MostAbsentStudents />
        <DailySummary />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>إدارة المعلمات</CardTitle>
            </div>
            <CardDescription className="mt-2">
              عرض وتعديل وحذف بيانات المعلمات، وإضافة معلمات جدد إلى النظام.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/teachers">
              <Button variant="outline" className="w-full sm:w-auto">الانتقال إلى صفحة المعلمات</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <School className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>إدارة الصفوف</CardTitle>
            </div>
            <CardDescription className="mt-2">
              عرض الصفوف الدراسية، وتعيين المعلمات، وإدارة الطلاب في كل صف.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/classes">
              <Button variant="outline" className="w-full sm:w-auto">الانتقال إلى صفحة الصفوف</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
