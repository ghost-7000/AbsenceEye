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

import type { Student, AttendanceStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { getTeacherClassesAndStudents, saveAttendance, getAttendanceForDate } from '@/app/actions/teacher-actions';
import { Loader2 } from 'lucide-react';
import type { ClassWithStudents } from '@/app/actions/teacher-actions';
import { format } from 'date-fns';

type AttendanceRecordForDate = Awaited<ReturnType<typeof getAttendanceForDate>>[number];

import { useLanguage, useTranslation } from '@/components/language-provider';

export function AttendanceTracker() {
  const [teacherClasses, setTeacherClasses] = React.useState<ClassWithStudents[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = React.useState<string>('');
  const [attendance, setAttendance] = React.useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const { toast } = useToast();
  const { lang } = useLanguage();
  const t = useTranslation();

  const initializeAttendance = React.useCallback((studentsToInit: Student[], savedAttendance: AttendanceRecordForDate[]) => {
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
                toast({ variant: 'destructive', title: t.errorGen, description: 'User not found' });
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
            toast({ variant: 'destructive', title: t.errorGen, description: t.errorGen });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast, initializeAttendance, t]);

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
      const selectedClass = teacherClasses.find(c=> c.id === selectedClassId);
      const className = lang === 'en' && selectedClass?.name_en ? selectedClass.name_en : selectedClass?.name;

      toast({
          title: t.save + " " + t.status,
          description: `${t.takeAttendance} ${className}.`,
      });
    } catch(e) {
      toast({
          variant: 'destructive',
          title: t.errorGen,
          description: t.errorGen,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.takeAttendance || 'تسجيل الحضور والغياب'}</CardTitle>
        <CardDescription>
          {lang === 'en' ? 'Select a class and record attendance for today.' : 'اختر صفًا وقم بتسجيل حضور الطلاب لليوم.'}
        </CardDescription>
        <div className="pt-4">
          <Label htmlFor="class-select">{t.classes}</Label>
          <Select value={selectedClassId} onValueChange={handleClassChange} disabled={loading}>
            <SelectTrigger id="class-select" className="w-full md:w-[300px]">
              <SelectValue placeholder={t.search} />
            </SelectTrigger>
            <SelectContent>
              {teacherClasses.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {lang === 'en' && c.name_en ? c.name_en : c.name}
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
              <TableHead>{t.name}</TableHead>
              <TableHead className="text-center">{t.status}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map(student => {
                  const studentName = lang === 'en' && student.name_en ? student.name_en : student.name;
                  return (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={student.avatarUrl || undefined} alt={studentName} />
                        <AvatarFallback>{studentName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{studentName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${attendance[student.id] === 'absent' ? 'text-red-500' : 'text-muted-foreground'}`}>{t.absent}</span>
                        <Switch
                            checked={attendance[student.id] === 'present'}
                            onCheckedChange={(checked) => handleAttendanceChange(student.id, checked)}
                            aria-label={`Attendance ${studentName}`}
                        />
                         <span className={`text-sm font-medium ${attendance[student.id] === 'present' ? 'text-green-600' : 'text-muted-foreground'}`}>{t.present}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  {teacherClasses.length > 0 ? t.noData : (lang === 'en' ? 'No classes found.' : 'لا توجد صفوف.')}
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
            {isSaving && <Loader2 className="mx-2 h-4 w-4 animate-spin" />}
            {t.save}
          </Button>
      </CardFooter>
    </Card>
  );
}
