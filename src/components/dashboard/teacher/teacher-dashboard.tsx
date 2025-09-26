'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClassManagement from './class-management';
import AttendanceTracker from './attendance-tracker';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatsCard } from '../stats-card';
import { BookOpen, Users, UserCheck } from 'lucide-react';
import { classes, students } from '@/lib/data';

export default function TeacherDashboard() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tab);

  const teacherId = '2';
  const teacherClasses = classes.filter(c => c.teacherId === teacherId);
  const teacherStudents = students.filter(s => teacherClasses.some(tc => tc.id === s.classId));


  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const Overview = () => (
    <div className="grid gap-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold md:text-3xl">نظرة عامة</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard 
                title="صفوفي"
                value={teacherClasses.length.toString()}
                icon={BookOpen}
                description="إجمالي عدد الصفوف المسندة إليك"
            />
             <StatsCard 
                title="طلابي"
                value={teacherStudents.length.toString()}
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
        <ClassManagement />
        <AttendanceTracker />
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        <TabsTrigger value="attendance">تسجيل الحضور</TabsTrigger>
        <TabsTrigger value="classes">إدارة الصفوف</TabsTrigger>
      </TabsList>
       <TabsContent value="overview">
            <Overview />
      </TabsContent>
      <TabsContent value="attendance">
            <AttendanceTracker />
      </TabsContent>
      <TabsContent value="classes">
            <ClassManagement />
      </TabsContent>
    </Tabs>
  );
}
