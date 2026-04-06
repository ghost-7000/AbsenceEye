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
import { useLanguage, getLocalizedName, useTranslation } from '@/components/language-provider';

export default function ClassManagement({ initialClasses }: { initialClasses: ClassWithStudentCount[] }) {
  const { lang } = useLanguage();
  const t = useTranslation();
  const [classes, setClasses] = React.useState<ClassWithStudentCount[]>(initialClasses);
  
  if (!classes || classes.length === 0) {
    return (
         <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <School className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">{t.noClasses}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                {t.noData}
            </p>
        </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.className}</TableHead>
            <TableHead>{t.subject || 'المادة'}</TableHead>
            <TableHead>{t.teacherName}</TableHead>
            <TableHead className="text-center">{t.studentsCount}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell className="font-medium">{getLocalizedName({ name: cls.name, name_en: cls.name_en }, lang)}</TableCell>
              <TableCell>{cls.subject ? <Badge variant="outline">{cls.subject}</Badge> : '---'}</TableCell>
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
