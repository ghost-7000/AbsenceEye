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

import type { Student, AttendanceStatus, Class } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { getTeacherClassesAndStudents, saveAttendance } from '@/app/actions/teacher-actions';
import { Loader2 } from 'lucide-react';


export default function AttendanceTracker() {
  const [teacherClasses, setTeacherClasses] = React.useState<Class[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = React.useState<string>('');
  const [attendance, setAttendance] = React.useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchData() {
        setLoading(true);
        try {
            const teacherId = 'user-2'; // static for demo
            const classesWithStudents = await getTeacherClassesAndStudents(teacherId);
            const classes = classesWithStudents.map(({ students, ...c }) => c);
            setTeacherClasses(classes);

            if (classes.length > 0) {
                const currentSelectedClass = classes[0].id;
                setSelectedClass(currentSelectedClass);
                const classStudents = classesWithStudents.find(c => c.id === currentSelectedClass)?.students || [];
                setStudents(classStudents);
                const initialAttendance = classStudents.reduce((acc, student) => {
                    acc[student.id] = 'present';
                    return acc;
                }, {} as Record<string, AttendanceStatus>);
                setAttendance(initialAttendance);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل بيانات الصفوف.' });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast]);

  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setLoading(true);
     try {
        const teacherId = 'user-2';
        const classesWithStudents = await getTeacherClassesAndStudents(teacherId);
        const classStudents = classesWithStudents.find(c => c.id === classId)?.students || [];
        setStudents(classStudents);
        const initialAttendance = classStudents.reduce((acc, student) => {
            acc[student.id] = 'present';
            return acc;
        }, {} as Record<string, AttendanceStatus>);
        setAttendance(initialAttendance);
    } catch (error) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل طلاب الصف.' });
    } finally {
        setLoading(false);
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
      const recordsToSave = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        classId: selectedClass,
        status,
      }));
      
      await saveAttendance(recordsToSave);

      toast({
          title: "تم حفظ الحضور",
          description: `تم تسجيل الحضور والغياب لصف ${teacherClasses.find(c=> c.id === selectedClass)?.name}.`,
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
          <Select value={selectedClass} onValueChange={handleClassChange} disabled={loading}>
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
