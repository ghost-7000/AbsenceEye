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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getMostAbsentStudents } from '@/app/actions/admin-actions';
import { Loader2 } from 'lucide-react';
import type { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation, useLanguage } from '@/components/language-provider';

interface AbsentStudent extends Student {
  absences: number;
  className: string;
}

export default function MostAbsentStudents() {
  const [mostAbsent, setMostAbsent] = React.useState<AbsentStudent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const t = useTranslation();
  const { lang } = useLanguage();

  React.useEffect(() => {
    async function fetchMostAbsent() {
      setLoading(true);
      try {
        const data = await getMostAbsentStudents();
        setMostAbsent(data);
      } catch (error) {
        console.error('Failed to fetch most absent students', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMostAbsent();
  }, []);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{t.mostAbsent}</CardTitle>
        <CardDescription>{t.mostAbsentDesc}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : mostAbsent.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.student}</TableHead>
                <TableHead className="text-center">{t.absenceDays}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mostAbsent.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-sm">
                          {(lang === 'en' && student.name_en ? student.name_en : student.name).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {lang === 'en' && student.name_en ? student.name_en : student.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{student.className}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="destructive">{student.absences}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium">{t.noAbsenceData}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t.noAbsenceDataDesc}</p>
          </div>
        )}
      </CardContent>
      {mostAbsent.length > 0 && (
        <div className="border-t p-4">
          <Link href="/admin/attendance-records">
            <Button variant="ghost" size="sm" className="w-full">
              {t.viewAllRecords}
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
