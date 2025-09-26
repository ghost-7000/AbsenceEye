'use client'

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import type { Student, AttendanceStatus, Class, AttendanceRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { getTeacherClassesAndStudents, saveAttendance, getAttendanceForDate } from '@/app/actions/teacher-actions';
import { Loader2 } from 'lucide-react';
import type { ClassWithStudents } from '@/app/actions/teacher-actions';
import { format } from 'date-fns';

export function AttendanceTracker() {
  const [teacherClasses, setTeacherClasses] = React.useState<ClassWithStudents[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = React.useState<string>('');
  const [attendance, setAttendance] = React.useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const { toast } = useToast();

  const initializeAttendance = React.useCallback((studentsToInit: Student[], savedAttendance: AttendanceRecord[]) => {
      const savedMap = new Map(savedAttendance.map(rec => [rec.studentId, rec.status]));
      const initialAttendance: Record<string, AttendanceStatus> = {};
      studentsToInit.forEach(student => {
          initialAttendance[student.id] = savedMap.get(student.id) || 'present';
      });
      setAttendance(initialAttendance);
  }, []);

  React.useEffect(() => {
    async function fetchData() {
        setLoading(true);
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم العثور على المعلم.' });
                setLoading(false);
                return;
            }
            
            const classesWithStudents = await getTeacherClassesAndStudents(userId);
            setTeacherClasses(classesWithStudents);
            
            const today = format(new Date(), 'yyyy-MM-dd');
            const savedAttendance = await getAttendanceForDate(userId, today);

            if (classesWithStudents.length > 0) {
                const firstClassId = classesWithStudents[0].id;
                setSelectedClassId(firstClassId);
                const classStudents = classesWithStudents[0].students || [];
                setStudents(classStudents);
                initializeAttendance(classStudents, savedAttendance);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل بيانات الصفوف.' });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast, initializeAttendance]);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const classData = teacherClasses.find(c => c.id === classId);
    const classStudents = classData?.students || [];
    setStudents(classStudents);
    
    // We assume the loaded attendance is for all of the teacher's students for the day
    // So we just need to re-initialize for the new set of students
    const today = format(new Date(), 'yyyy-MM-dd');
    const userId = localStorage.getItem('userId');
    if (userId) {
      getAttendanceForDate(userId, today).then(savedAttendance => {
        initializeAttendance(classStudents, savedAttendance);
      });
    }
  }


  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isPresent ? 'present' : 'absent',
    }));
  };
  
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      const recordsToSave = Object.entries(attendance)
        .filter(([studentId]) => students.some(s => s.id === studentId))
        .map(([studentId, status]) => ({
            studentId,
            classId: selectedClassId,
            status,
      }));
      
      await saveAttendance(recordsToSave);

      toast({
          title: "تم حفظ الحضور",
          description: `تم تسجيل الحضور والغياب لصف ${teacherClasses.find(c=> c.id === selectedClassId)?.name}.`,
      });
    } catch(e) {
      toast({
          variant: 'destructive',
          title: "فشل حفظ الحضور",
          description: "حدث خطأ أثناء حفظ البيانات.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تسجيل الحضور والغياب</CardTitle>
        <CardDescription>
          اختر صفًا وقم بتسجيل حضور الطلاب لليوم.
        </CardDescription>
        <div className="pt-4">
          <Label htmlFor="class-select">اختر الصف</Label>
          <Select value={selectedClassId} onValueChange={handleClassChange} disabled={loading}>
            <SelectTrigger id="class-select" className="w-full md:w-[300px]">
              <SelectValue placeholder="اختر صفًا" />
            </SelectTrigger>
            <SelectContent>
              {teacherClasses.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
       {loading ? (
         <div className="flex justify-center items-center h-64">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       ) : (
        <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الطالب</TableHead>
              <TableHead className="text-center">الحالة (حاضر/غائب)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map(student => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={student.avatarUrl || undefined} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{student.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${attendance[student.id] === 'absent' ? 'text-red-500' : 'text-muted-foreground'}`}>غائب</span>
                        <Switch
                            checked={attendance[student.id] === 'present'}
                            onCheckedChange={(checked) => handleAttendanceChange(student.id, checked)}
                            aria-label={`حالة حضور ${student.name}`}
                        />
                         <span className={`text-sm font-medium ${attendance[student.id] === 'present' ? 'text-green-600' : 'text-muted-foreground'}`}>حاضر</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  {teacherClasses.length > 0 ? 'لا يوجد طلاب في هذا الصف.' : 'لا توجد صفوف. الرجاء إنشاء صف جديد أولاً.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
       )}
      </CardContent>
      <CardFooter>
          <Button onClick={handleSaveAttendance} disabled={students.length === 0 || isSaving || loading}>
            {isSaving && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ الحضور
          </Button>
      </CardFooter>
    </Card>
  );
}
