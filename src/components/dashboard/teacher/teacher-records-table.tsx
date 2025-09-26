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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getDetailedAttendanceForTeacher } from '@/app/actions/teacher-actions';
import type { DetailedAttendanceRecord } from '@/app/actions/admin-actions';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function TeacherRecordsTable() {
  const [records, setRecords] = React.useState<DetailedAttendanceRecord[]>([]);
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
        setRecords(data);
      } catch (error) {
        console.error("Failed to fetch attendance records", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(record => {
    const recordDate = format(new Date(record.date), 'yyyy-MM-dd');
    const matchesDate = recordDate === filterDate;
    const matchesSearch = searchTerm === '' || 
                          record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.className.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>سجلات الحضور الخاصة بي</CardTitle>
        <CardDescription>عرض وتصفية سجلات حضور وغياب طلابك.</CardDescription>
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
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الطالب</TableHead>
                  <TableHead>الصف</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), 'd MMMM yyyy', { locale: ar })}</TableCell>
                      <TableCell className="font-medium">{record.studentName}</TableCell>
                      <TableCell>{record.className}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={record.status === 'present' ? 'secondary' : 'destructive'}>
                          {record.status === 'present' ? 'حاضر' : 'غائب'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      لا توجد سجلات مطابقة للبحث أو التاريخ المحدد.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
