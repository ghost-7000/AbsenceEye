'use client'

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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getDetailedAttendanceForTeacher } from '@/app/actions/teacher-actions';
import type { DetailedAttendanceRecord } from '@/app/actions/admin-actions';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';


interface GroupedRecords {
    [className: string]: {
        records: DetailedAttendanceRecord[];
        time: string | null;
    }
}


export default function TeacherRecordsTable() {
  const [allRecords, setAllRecords] = React.useState<DetailedAttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterDate, setFilterDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));

  React.useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      const teacherId = localStorage.getItem('userId');
      if (!teacherId) {
        console.error("Teacher ID not found");
        setLoading(false);
        return;
      }
      try {
        const data = await getDetailedAttendanceForTeacher(teacherId);
        setAllRecords(data);
      } catch (error) {
        console.error("Failed to fetch attendance records", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  const groupedAndFilteredRecords: GroupedRecords = React.useMemo(() => {
    const grouped: GroupedRecords = {};

    allRecords
      .filter(record => {
        const recordDate = record.date.substring(0, 10);
        return recordDate === filterDate;
      })
      .forEach(record => {
        const studentName = record.studentName;
        const className = record.className;
        
        const matchesSearch = searchTerm === '' || 
                              studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              className.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (matchesSearch) {
          if (!grouped[className]) {
            grouped[className] = { 
                records: [], 
                time: record.timestamp ? format(new Date(record.timestamp), 'hh:mm a') : null
            };
          }
          grouped[className].records.push(record);
        }
      });
    
      if (searchTerm) {
          const lowercasedSearch = searchTerm.toLowerCase();
          const finalGroup: GroupedRecords = {};
          Object.keys(grouped).forEach(className => {
              if (className.toLowerCase().includes(lowercasedSearch)) {
                  finalGroup[className] = grouped[className];
              } else { 
                  const filteredStudents = grouped[className].records.filter(
                      record => record.studentName.toLowerCase().includes(lowercasedSearch)
                  );
                  if (filteredStudents.length > 0) {
                      finalGroup[className] = {
                          ...grouped[className],
                          records: filteredStudents
                      };
                  }
              }
          });
          return finalGroup;
      }

    return grouped;

  }, [allRecords, filterDate, searchTerm]);

  const sortedClassNames = Object.keys(groupedAndFilteredRecords).sort();


  return (
    <Card>
      <CardHeader>
        <CardTitle>سجلات الحضور الخاصة بي</CardTitle>
        <CardDescription>عرض وتصفية سجلات حضور وغياب طلابك حسب الصف.</CardDescription>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="max-w-sm"
            />
            <Input
                placeholder="بحث باسم الطالب أو الصف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedClassNames.length > 0 ? (
           <Accordion type="multiple" className="w-full space-y-4" defaultValue={sortedClassNames}>
             {sortedClassNames.map(className => {
                const { records, time } = groupedAndFilteredRecords[className];
                const presentCount = records.filter(r => r.status === 'present').length;
                const absentCount = records.length - presentCount;

                return (
                    <AccordionItem value={className} key={className} className="border rounded-lg">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className='flex justify-between items-center w-full'>
                                <div className='text-start'>
                                    <h3 className="font-semibold text-lg">{className}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {time ? `وقت التسجيل: ${time}` : ''}
                                    </p>
                                </div>
                                <div className="flex gap-4 text-sm pe-4">
                                     <span><Badge variant="secondary">العدد: {records.length}</Badge></span>
                                     <span><Badge variant="outline" className="text-green-600 border-green-200">حضور: {presentCount}</Badge></span>
                                     <span><Badge variant="destructive">غياب: {absentCount}</Badge></span>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="border-t">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>الطالب</TableHead>
                                      <TableHead className="text-center">الحالة</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {records.sort((a, b) => a.studentName.localeCompare(b.studentName)).map(record => (
                                      <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.studentName}</TableCell>
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
                        </AccordionContent>
                    </AccordionItem>
                )
             })}
           </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center mt-6">
                <h3 className="text-lg font-medium">لا توجد سجلات</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    لا توجد سجلات حضور مطابقة لليوم أو البحث المحدد.
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
