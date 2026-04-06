'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '../stats-card';
import { BookOpen, Users, UserCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { getTeacherStats } from '@/app/actions/teacher-actions';
import { useTranslation, useLanguage } from '@/components/language-provider';

interface TeacherDashboardStats {
  classCount: number;
  studentCount: number;
  attendancePercentage: number;
}

export default function TeacherDashboard() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const t = useTranslation();
  const { lang } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    async function fetchStats() {
      setLoading(true);
      const teacherId = localStorage.getItem('userId');
      const storedName = lang === 'en'
        ? (localStorage.getItem('userNameEn') || localStorage.getItem('userName') || '')
        : (localStorage.getItem('userName') || '');
      setUserName(storedName);

      if (teacherId) {
        try {
          const fetchedStats = await getTeacherStats(teacherId);
          setStats(fetchedStats);
        } catch (error) {
          console.error('Failed to fetch teacher stats:', error);
          setStats({ classCount: 0, studentCount: 0, attendancePercentage: 0 });
        }
      }
      setLoading(false);
    }

    fetchStats();
    return () => clearInterval(timer);
  }, [lang]);

  const locale = lang === 'ar' ? ar : enUS;
  const formattedDate = format(currentDateTime, 'eeee, d MMMM yyyy', { locale });
  const formattedTime = format(currentDateTime, 'hh:mm:ss a');

  return (
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">{t.dashboard}</h1>
        <Card className="w-full sm:w-auto">
          <CardContent className="p-3 text-center">
            <p className="text-sm font-semibold">{formattedDate}</p>
            <p className="text-lg font-bold text-primary tabular-nums">{formattedTime}</p>
          </CardContent>
        </Card>
      </div>

      {loading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[t.myClassesCount, t.myStudentsCount, t.myAttendanceRate].map((title) => (
            <Card key={title}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle></CardHeader>
              <CardContent><Loader2 className="h-6 w-6 animate-spin text-primary" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="صفوفي"
            titleEn="My Classes"
            value={stats.classCount.toString()}
            icon={BookOpen}
            description="إجمالي عدد الصفوف المسندة إليك"
            descriptionEn="Total classes assigned to you"
          />
          <StatsCard
            title="طلابي"
            titleEn="My Students"
            value={stats.studentCount.toString()}
            icon={Users}
            description="إجمالي عدد الطلاب في صفوفك"
            descriptionEn="Total students across your classes"
          />
          <StatsCard
            title="نسبة الحضور اليوم"
            titleEn="Today's Attendance Rate"
            value={`${stats.attendancePercentage}%`}
            icon={UserCheck}
            description="نسبة حضور الطلاب المسجلين اليوم"
            descriptionEn="Percentage of students present today"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t.welcomeBack} {userName && `، ${userName}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {lang === 'ar'
              ? 'من هنا يمكنك إدارة صفوفك، تسجيل حضور وغياب الطلاب، ومتابعة آخر المستجدات. استخدم الشريط الجانبي للتنقل بين الأقسام المختلفة.'
              : 'From here you can manage your classes, record student attendance, and track the latest updates. Use the sidebar to navigate between sections.'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
