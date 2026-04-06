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
import type { DetailedAttendanceRecord } from '@/app/actions/teacher-actions';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Label } from '@/components/ui/label';
import type { ClassWithStudents } from '@/app/actions/teacher-actions';
import { Calendar } from '@/components/ui/calendar';
import { useTranslation, useLanguage } from '@/components/language-provider';

export default function TeacherRecordsTable() {
  const [allRecords, setAllRecords] = React.useState<DetailedAttendanceRecord[]>([]);
  const [teacherClasses, setTeacherClasses] = React.useState<ClassWithStudents[]>([]);
  const [selectedClassId, setSelectedClassId] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [loadingRecords, setLoadingRecords] = React.useState(false);
  const t = useTranslation();
  const { lang } = useLanguage();
  
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
        setLoading(false);
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
        <CardTitle>{t.myRecords}</CardTitle>
        <CardDescription>
          {lang === 'ar' ? 'اختر صفًا ثم يومًا من التقويم لعرض سجلات الحضور والغياب.' : 'Select a class then a day from the calendar to view attendance records.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 flex flex-col gap-4">
                 <div>
                    <Label htmlFor="class-select">{lang === 'ar' ? '1. اختر الصف' : '1. Select Class'}</Label>
                     <Select value={selectedClassId} onValueChange={handleClassChange} disabled={teacherClasses.length === 0}>
                        <SelectTrigger id="class-select" className="w-full mt-2">
                          <SelectValue placeholder={t.classes} />
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
                 <div>
                    <Label>{lang === 'ar' ? '2. اختر اليوم' : '2. Select Day'}</Label>
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
                        {lang === 'ar' ? 'الأيام المتاحة محددة بإطار.' : 'Days with recorded attendance are highlighted.'}
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
                        <TableHead>{t.student}</TableHead>
                        {selectedClassSubject && <TableHead>{t.subject}</TableHead>}
                        <TableHead className="text-center">{t.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map(record => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.studentName}</TableCell>
                           {selectedClassSubject && <TableCell><Badge variant="outline">{record.subject || t.notSpecified}</Badge></TableCell>}
                          <TableCell className="text-center">
                            <Badge variant={record.status === 'present' ? 'secondary' : 'destructive'}>
                              {record.status === 'present' ? t.present : t.absent}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center h-full">
                        <h3 className="text-lg font-medium">{t.noRecordsFound}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{t.noRecordsYet}</p>
                    </div>
                 )
              ) : (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center h-full">
                    <h3 className="text-lg font-medium">{lang === 'ar' ? 'الرجاء اختيار صف ويوم' : 'Select a Class and Day'}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                       {lang === 'ar' ? 'اختر صفًا ويومًا من القائمة والتقويم لعرض السجلات.' : 'Select a class and day from the list and calendar to view records.'}
                    </p>
                </div>
              )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
