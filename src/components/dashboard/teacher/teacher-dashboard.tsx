'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '../stats-card';
import { BookOpen, Users, UserCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import dbConnect from '@/lib/mongodb';
import { ClassModel, StudentModel, AttendanceRecordModel } from '@/lib/models';


async function getTeacherStats(teacherId: string) {
    await dbConnect();
    
    const classCount = await ClassModel.countDocuments({ teacherId: teacherId });
    
    const teacherClasses = await ClassModel.find({ teacherId: teacherId }).select('_id');
    const classIds = teacherClasses.map(c => c._id);

    const studentCount = await StudentModel.countDocuments({ classId: { $in: classIds } });
    
    let attendancePercentage = 0;
    if (studentCount > 0) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const students = await StudentModel.find({ classId: { $in: classIds } }).select('_id');
        const studentIds = students.map(s => s._id.toString());
        
        const presentCount = await AttendanceRecordModel.countDocuments({
            studentId: { $in: studentIds },
            date: today,
            status: 'present'
        });
        attendancePercentage = Math.round((presentCount / studentCount) * 100);
    }

    return { classCount, studentCount, attendancePercentage };
}


interface TeacherDashboardStats {
  classCount: number;
  studentCount: number;
  attendancePercentage: number;
}

export default function TeacherDashboard() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second
    
    async function fetchStats() {
      setLoading(true);
      const teacherId = localStorage.getItem('userId');
      if (teacherId) {
        const fetchedStats = await getTeacherStats(teacherId);
        setStats(fetchedStats);
      }
      setLoading(false);
    }

    fetchStats();

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
      
      {loading || !stats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">صفوفي</CardTitle></CardHeader><CardContent><Loader2 className="h-6 w-6 animate-spin"/></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">طلابي</CardTitle></CardHeader><CardContent><Loader2 className="h-6 w-6 animate-spin"/></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">نسبة الحضور اليوم</CardTitle></CardHeader><CardContent><Loader2 className="h-6 w-6 animate-spin"/></CardContent></Card>
          </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="صفوفي"
            value={stats.classCount.toString()}
            icon={BookOpen}
            description="إجمالي عدد الصفوف المسندة إليك"
          />
          <StatsCard
            title="طلابي"
            value={stats.studentCount.toString()}
            icon={Users}
            description="إجمالي عدد الطلاب في صفوفك"
          />
          <StatsCard
            title="نسبة الحضور اليوم"
            value={`${stats.attendancePercentage}%`}
            icon={UserCheck}
            description="نسبة حضور الطلاب المسجلين اليوم"
          />
        </div>
      )}

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
