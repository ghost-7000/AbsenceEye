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
import { ar, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { useTranslation, useLanguage } from '@/components/language-provider';

export default function AttendanceRecordsTable({ initialRecords }: { initialRecords: DetailedAttendanceRecord[] }) {
  const [records] = React.useState<DetailedAttendanceRecord[]>(initialRecords);
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [date, setDate] = React.useState<Date | undefined>();
  const t = useTranslation();
  const { lang } = useLanguage();

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
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.searchByNameOrClass}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'flex-1 sm:w-[220px] justify-start text-start font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="me-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: lang === 'ar' ? ar : enUS }) : t.chooseDate}
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
            <Button variant="ghost" onClick={() => setDate(undefined)} size="sm">
              {t.clearDate}
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.student}</TableHead>
              <TableHead>{t.class}</TableHead>
              <TableHead className="hidden md:table-cell">{t.subject}</TableHead>
              <TableHead>{t.date}</TableHead>
              <TableHead className="text-center">{t.status}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium whitespace-nowrap">{record.studentName}</TableCell>
                  <TableCell className="whitespace-nowrap">{record.className}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {record.subject
                      ? <Badge variant="outline">{record.subject}</Badge>
                      : <span className="text-muted-foreground text-sm">{t.notSpecified}</span>
                    }
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(record.date), 'yyyy/MM/dd')}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={record.status === 'present' ? 'secondary' : 'destructive'}>
                      {record.status === 'present' ? t.present : t.absent}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <ClipboardList className="h-12 w-12 text-muted-foreground" />
                    <h3 className="font-semibold">{t.noRecordsFound}</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchTerm || date ? t.noRecordsTryFilter : t.noRecordsYet}
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
