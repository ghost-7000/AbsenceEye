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

import { students, attendanceRecords, classes } from '@/lib/data';
import type { Student } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface AbsentStudent extends Student {
  absences: number;
}

export default function MostAbsentStudents() {
  const [mostAbsent, setMostAbsent] = React.useState<AbsentStudent[]>([]);

  React.useEffect(() => {
    const absenceCounts = attendanceRecords.reduce((acc, record) => {
      if (record.status === 'absent') {
        acc[record.studentId] = (acc[record.studentId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sortedStudents: AbsentStudent[] = students
      .map(student => ({
        ...student,
        absences: absenceCounts[student.id] || 0,
      }))
      .filter(student => student.absences > 0)
      .sort((a, b) => b.absences - a.absences)
      .slice(0, 5); // Get top 5

    setMostAbsent(sortedStudents);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>أكثر الطلاب غيابًا</CardTitle>
        <CardDescription>قائمة بالطلاب الأكثر غيابًا خلال الأسبوع الماضي.</CardDescription>
      </CardHeader>
      <CardContent>
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
              mostAbsent.map(student => {
                const studentClass = classes.find(c => c.id === student.classId);
                return (
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
                    <TableCell>{studentClass?.name || 'غير معروف'}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant="destructive">{student.absences}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  لا يوجد طلاب غائبون.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
