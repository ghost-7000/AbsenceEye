'use client';

import * as React from 'react';
import { School, Users, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ClassWithStudentCount } from '@/app/actions/admin-actions';

export default function ClassManagement({ initialClasses }: { initialClasses: ClassWithStudentCount[] }) {
  const [classes, setClasses] = React.useState<ClassWithStudentCount[]>(initialClasses);
  
  if (!classes || classes.length === 0) {
    return (
         <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <School className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">لا توجد صفوف دراسية</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                لم يتم إنشاء أي صفوف دراسية في النظام بعد.
            </p>
        </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم الصف</TableHead>
            <TableHead>المعلمة المسؤولة</TableHead>
            <TableHead className="text-center">عدد الطلاب</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell className="font-medium">{cls.name}</TableCell>
              <TableCell>{cls.teacherName}</TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">{cls.studentCount}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
