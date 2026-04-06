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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AbsentStudent extends Student {
  absences: number;
  className: string;
}

export default function MostAbsentStudents() {
  const [mostAbsent, setMostAbsent] = React.useState<AbsentStudent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMostAbsent() {
      setLoading(true);
      try {
        const data = await getMostAbsentStudents();
        setMostAbsent(data);
      } catch (error) {
        console.error("Failed to fetch most absent students", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMostAbsent();
  }, []);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>الطلاب الأكثر غيابًا</CardTitle>
        <CardDescription>قائمة بالطلاب الخمسة الأكثر غيابًا هذا العام.</CardDescription>
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
                <TableHead>الطالب</TableHead>
                <TableHead className="text-center">أيام الغياب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {mostAbsent.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{student.name}</div>
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
                <h3 className="text-lg font-medium">لا توجد بيانات غياب</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    لم يتم تسجيل أي حالات غياب حتى الآن.
                </p>
            </div>
        )}
      </CardContent>
       {mostAbsent.length > 0 && (
         <div className="border-t p-4">
            <Link href="/admin/attendance-records">
                <Button variant="ghost" size="sm" className="w-full">
                    عرض كل السجلات <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
            </Link>
         </div>
      )}
    </Card>
  );
}
