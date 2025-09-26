'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '../stats-card';
import { BookOpen, Users, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TeacherDashboardProps {
  classCount: number;
  studentCount: number;
}

export default function TeacherDashboard({ classCount, studentCount }: TeacherDashboardProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second

    return () => {
      clearInterval(timer); // Cleanup timer on component unmount
    };
  }, []);

  const formattedDate = format(currentDateTime, 'eeee, d MMMM yyyy', { locale: ar });
  const formattedTime = format(currentDateTime, 'hh:mm:ss a', { locale: ar });

  return (
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">لوحة التحكم</h1>
        <Card className="w-full sm:w-auto">
          <CardContent className="p-3 text-center">
            <p className="text-sm font-semibold">{formattedDate}</p>
            <p className="text-lg font-bold text-primary">{formattedTime}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="صفوفي"
          value={classCount.toString()}
          icon={BookOpen}
          description="إجمالي عدد الصفوف المسندة إليك"
        />
        <StatsCard
          title="طلابي"
          value={studentCount.toString()}
          icon={Users}
          description="إجمالي عدد الطلاب في صفوفك"
        />
        <StatsCard
          title="نسبة الحضور اليوم"
          value="95%"
          icon={UserCheck}
          description="نسبة حضور الطلاب اليوم (مثال)"
        />
      </div>
      <Card>
        <CardHeader>
            <CardTitle>مرحباً بك!</CardTitle>
        </CardHeader>
        <CardContent>
             <p className="text-muted-foreground">
                من هنا يمكنك إدارة صفوفك، تسجيل حضور وغياب الطلاب، ومتابعة آخر المستجدات. استخدم الشريط الجانبي للتنقل بين الأقسام المختلفة.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
