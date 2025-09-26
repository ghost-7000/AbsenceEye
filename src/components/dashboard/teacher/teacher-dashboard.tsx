import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClassManagement from './class-management';
import AttendanceTracker from './attendance-tracker';

export default function TeacherDashboard() {
  return (
    <Tabs defaultValue="attendance" className="w-full">
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
