import { Users, School, UserCheck, BarChart3, Users2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { getAdminStats, getClassesWithStudentCounts, getSchoolHierarchy } from '@/app/actions/admin-actions';
import MostAbsentStudents from '@/components/dashboard/admin/most-absent-students';
import DailySummary from '@/components/dashboard/admin/daily-summary';
import { SchoolHierarchy } from '@/components/dashboard/admin/school-hierarchy';
import { LocalizedText } from '@/components/language-provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboardPage() {
  const [{ totalTeachers, totalClasses, totalStudents }, hierarchyData] = await Promise.all([
    getAdminStats(),
    getSchoolHierarchy(),
  ]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl"><LocalizedText tKey="dashboard" /></h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title={<LocalizedText tKey="totalTeachers" />}
          value={totalTeachers.toString()}
          icon={Users}
          description={<LocalizedText tKey="totalTeachersDesc" />}
        />
        <StatsCard
          title={<LocalizedText tKey="totalClasses" />}
          value={totalClasses.toString()}
          icon={School}
          description={<LocalizedText tKey="totalClassesDesc" />}
        />
        <StatsCard
          title={<LocalizedText tKey="totalStudents" />}
          value={totalStudents.toString()}
          icon={Users2}
          description={<LocalizedText tKey="totalStudentsDesc" />}
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MostAbsentStudents />
        <DailySummary />
      </div>

      {/* School Hierarchy View */}
      <div className="w-full">
        <SchoolHierarchy data={hierarchyData} />
      </div>

       <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
           <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary" />
                        <CardTitle><LocalizedText tKey="manageTeachers" /></CardTitle>
                    </div>
                    <CardDescription className="mt-2 text-muted-foreground p-0">
                        <LocalizedText tKey="manageTeachersDesc" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/admin/teachers">
                        <Button variant="outline"><LocalizedText tKey="goToTeachers" /></Button>
                    </Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <School className="h-6 w-6 text-primary" />
                        <CardTitle><LocalizedText tKey="manageClasses" /></CardTitle>
                    </div>
                    <CardDescription className="mt-2 text-muted-foreground p-0">
                        <LocalizedText tKey="manageClassesDesc" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Link href="/admin/classes">
                        <Button variant="outline"><LocalizedText tKey="goToClasses" /></Button>
                    </Link>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
