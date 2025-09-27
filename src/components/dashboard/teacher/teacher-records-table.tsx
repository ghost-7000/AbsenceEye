'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Badge } from '@/components/ui/badge';
import { getDetailedAttendanceForTeacher, getTeacherClassesAndStudents } from '@/app/actions/teacher-actions';
import type { DetailedAttendanceRecord } from '@/app/actions/admin-actions';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Label } from '@/components/ui/label';
import type { ClassWithStudents } from '@/app/actions/teacher-actions';
import { Calendar } from '@/components/ui/calendar';

export default function TeacherRecordsTable() {
  const [allRecords, setAllRecords] = React.useState<DetailedAttendanceRecord[]>([]);
  const [teacherClasses, setTeacherClasses] = React.useState<ClassWithStudents[]>([]);
  const [selectedClassId, setSelectedClassId] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [loadingRecords, setLoadingRecords] = React.useState(false);
  
  const availableDates = React.useMemo(() => {
    if (!selectedClassId) return [];
    const dates = allRecords
      .filter(record => record.classId === selectedClassId)
      .map(record => record.date.substring(0, 10));
    return [...new Set(dates)].map(dateStr => parseISO(dateStr));
  }, [allRecords, selectedClassId]);

  const filteredRecords = React.useMemo(() => {
    if (!selectedClassId || !selectedDate) return [];
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return allRecords.filter(record => 
        record.classId === selectedClassId && 
        record.date.substring(0, 10) === dateString
    ).sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [allRecords, selectedClassId, selectedDate]);

  const fetchInitialData = React.useCallback(async () => {
    setLoading(true);
    try {
      const teacherId = localStorage.getItem('userId');
      if (!teacherId) {
        console.error('Teacher ID not found');
        return;
      }
      const [classesData, recordsData] = await Promise.all([
        getTeacherClassesAndStudents(teacherId),
        getDetailedAttendanceForTeacher(teacherId),
      ]);

      setTeacherClasses(classesData);
      setAllRecords(recordsData);

      if (classesData.length > 0) {
        setSelectedClassId(classesData[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedDate(undefined); // Reset date when class changes
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  const selectedClassSubject = teacherClasses.find(c => c.id === selectedClassId)?.subject;

  return (
    <Card>
      <CardHeader>
        <CardTitle>سجلاتي</CardTitle>
        <CardDescription>اختر صفًا ثم يومًا من التقويم لعرض سجلات الحضور والغياب.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 flex flex-col gap-4">
                 <div>
                    <Label htmlFor="class-select">1. اختر الصف</Label>
                     <Select value={selectedClassId} onValueChange={handleClassChange} disabled={teacherClasses.length === 0}>
                        <SelectTrigger id="class-select" className="w-full mt-2">
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
                 <div>
                    <Label>2. اختر اليوم</Label>
                    <div className="mt-2 rounded-md border flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => !availableDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) || date > new Date()}
                            modifiers={{ available: availableDates }}
                            modifiersStyles={{
                                available: { 
                                    border: "2px solid hsl(var(--primary))",
                                    borderRadius: 'var(--radius)',
                                }
                            }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        الأيام المتاحة (التي تم تسجيل الحضور فيها) محددة بإطار.
                    </p>
                 </div>
            </div>
            <div className="lg:col-span-2">
              {loadingRecords ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : selectedClassId && selectedDate ? (
                filteredRecords.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الطالب</TableHead>
                        {selectedClassSubject && <TableHead>المادة</TableHead>}
                        <TableHead className="text-center">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map(record => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.studentName}</TableCell>
                           {selectedClassSubject && <TableCell><Badge variant="outline">{selectedClassSubject}</Badge></TableCell>}
                          <TableCell className="text-center">
                            <Badge variant={record.status === 'present' ? 'secondary' : 'destructive'}>
                              {record.status === 'present' ? 'حاضر' : 'غائب'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center h-full">
                        <h3 className="text-lg font-medium">لا توجد سجلات</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            لم يتم العثور على سجلات حضور لهذا الصف في اليوم المحدد.
                        </p>
                    </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center h-full">
                    <h3 className="text-lg font-medium">الرجاء اختيار صف ويوم</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                       اختر صفًا ويومًا من القائمة والتقويم على اليسار لعرض السجلات.
                    </p>
                </div>
              )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
