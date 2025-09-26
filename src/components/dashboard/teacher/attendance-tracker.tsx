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

import { students as allStudents, classes as allClasses } from '@/lib/data';
import type { Student, Class, AttendanceStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function AttendanceTracker() {
  const teacherId = '2'; // Mock teacher ID
  const [teacherClasses] = React.useState<Class[]>(
    allClasses.filter(c => c.teacherId === teacherId)
  );
  const [selectedClass, setSelectedClass] = React.useState<string>(teacherClasses[0]?.id || '');
  const [students, setStudents] = React.useState<Student[]>([]);
  const [attendance, setAttendance] = React.useState<Record<string, AttendanceStatus>>({});
  const { toast } = useToast();

  React.useEffect(() => {
    if (selectedClass) {
      const classStudents = allStudents.filter(s => s.classId === selectedClass);
      setStudents(classStudents);
      // Initialize attendance state for the selected class
      const initialAttendance = classStudents.reduce((acc, student) => {
        acc[student.id] = 'present'; // Default to present
        return acc;
      }, {} as Record<string, AttendanceStatus>);
      setAttendance(initialAttendance);
    }
  }, [selectedClass]);

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isPresent ? 'present' : 'absent',
    }));
  };
  
  const handleSaveAttendance = () => {
    // In a real app, you would send this data to your backend API
    console.log('Saving attendance:', attendance);
    toast({
        title: "تم حفظ الحضور",
        description: `تم تسجيل الحضور والغياب لصف ${teacherClasses.find(c=> c.id === selectedClass)?.name}.`,
    });
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
          <Select value={selectedClass} onValueChange={setSelectedClass}>
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
                        <AvatarImage src={undefined} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{student.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${attendance[student.id] === 'absent' ? 'text-destructive' : 'text-muted-foreground'}`}>غائب</span>
                        <Switch
                            checked={attendance[student.id] === 'present'}
                            onCheckedChange={(checked) => handleAttendanceChange(student.id, checked)}
                            aria-label={`حالة حضور ${student.name}`}
                        />
                         <span className={`text-sm font-medium ${attendance[student.id] === 'present' ? 'text-primary' : 'text-muted-foreground'}`}>حاضر</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  اختر صفًا لعرض الطلاب.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
      <CardFooter>
          <Button onClick={handleSaveAttendance} disabled={students.length === 0}>حفظ الحضور</Button>
      </CardFooter>
    </Card>
  );
}
