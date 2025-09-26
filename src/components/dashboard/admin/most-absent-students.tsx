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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getMostAbsentStudents } from '@/app/actions/admin-actions';
import type { Student } from '@/lib/types';
import { Loader2 } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <CardTitle>أكثر الطلاب غيابًا</CardTitle>
        <CardDescription>قائمة بالطلاب الأكثر غيابًا.</CardDescription>
      </CardHeader>
      <CardContent>
         {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الطالب</TableHead>
              <TableHead>الصف</TableHead>
              <TableHead className="text-center">أيام الغياب</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mostAbsent.length > 0 ? (
              mostAbsent.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={student.avatarUrl || undefined} alt={student.name} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{student.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.className}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant="destructive">{student.absences}</Badge>
                    </TableCell>
                  </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  لا يوجد طلاب غائبون.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
