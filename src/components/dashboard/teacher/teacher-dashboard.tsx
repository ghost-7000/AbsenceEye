'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClassManagement from './class-management';
import AttendanceTracker from './attendance-tracker';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TeacherDashboard() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'attendance';
  const [activeTab, setActiveTab] = useState(tab);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="attendance">تسجيل الحضور</TabsTrigger>
        <TabsTrigger value="classes">إدارة الصفوف</TabsTrigger>
      </TabsList>
      <TabsContent value="attendance">
        <AttendanceTracker />
      </TabsContent>
      <TabsContent value="classes">
        <ClassManagement />
      </TabsContent>
    </Tabs>
  );
}
