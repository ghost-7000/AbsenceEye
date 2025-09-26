'use client';

import { StatsCard } from '../stats-card';
import { BookOpen, Users, UserCheck } from 'lucide-react';
import { useClasses } from '@/context/class-context';

export default function TeacherDashboard() {
  const { teacherClasses, teacherStudents } = useClasses();

  return (
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
        <div>
            <h2 className="text-xl font-bold mb-4">ملخص سريع</h2>
            <p>هنا يمكن عرض ملخص سريع لأهم الإحصائيات أو الإشعارات.</p>
        </div>
    </div>
  )
}