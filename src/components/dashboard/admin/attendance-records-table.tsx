'use client';

import * as React from 'react';
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
import type { DetailedAttendanceRecord } from '@/app/actions/admin-actions';
import { Calendar as CalendarIcon, ClipboardList, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

export default function AttendanceRecordsTable({ initialRecords }: { initialRecords: DetailedAttendanceRecord[]}) {
  const [records, setRecords] = React.useState<DetailedAttendanceRecord[]>(initialRecords);
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [date, setDate] = React.useState<Date | undefined>();

  const filteredRecords = React.useMemo(() => {
    return records.filter(record => {
      const matchesDate = !date || record.date.substring(0, 10) === format(date, 'yyyy-MM-dd');
      const matchesSearch = debouncedSearchTerm === '' || 
                            record.studentName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                            record.className.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [records, date, debouncedSearchTerm]);


  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="بحث باسم الطالب أو الصف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full sm:w-[280px] justify-start text-right font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="ms-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: ar }) : <span>اختر تاريخًا لتصفيته</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(d) => d > new Date() || d < new Date('2024-01-01')}
              />
            </PopoverContent>
          </Popover>
          {date && (
             <Button variant="ghost" onClick={() => setDate(undefined)}>مسح التاريخ</Button>
          )}
        </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الطالب</TableHead>
              <TableHead>الصف</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.studentName}</TableCell>
                    <TableCell>{record.className}</TableCell>
                    <TableCell>{format(new Date(record.date), 'yyyy/MM/dd')}</TableCell>
                    <TableCell className="text-center">
                    <Badge variant={record.status === 'present' ? 'secondary' : 'destructive'}>
                        {record.status === 'present' ? 'حاضر' : 'غائب'}
                    </Badge>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center">
                       <div className="flex flex-col items-center gap-4">
                            <ClipboardList className="h-12 w-12 text-muted-foreground" />
                            <h3 className="font-semibold">لم يتم العثور على سجلات</h3>
                            <p className="text-muted-foreground text-sm">
                                {searchTerm || date ? 'جرّب تعديل فلاتر البحث.' : 'لا توجد سجلات حضور مسجلة بعد.'}
                            </p>
                        </div>
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
