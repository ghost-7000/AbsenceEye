'use client';

import * as React from 'react';
import { School, Users, ChevronRight } from 'lucide-react';
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
import { useTranslation, useLanguage } from '@/components/language-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getStudentsByClass } from '@/app/actions/admin-actions';
import { Loader2 } from 'lucide-react';

interface ClassStudent {
  id: string;
  name: string;
  name_en?: string;
  avatarUrl: string;
}

export default function ClassManagement({ initialClasses }: { initialClasses: ClassWithStudentCount[] }) {
  const t = useTranslation();
  const { lang } = useLanguage();
  const [classes, setClasses] = React.useState<ClassWithStudentCount[]>(initialClasses);
  const [selectedClass, setSelectedClass] = React.useState<ClassWithStudentCount | null>(null);
  const [classStudents, setClassStudents] = React.useState<ClassStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleClassClick = async (cls: ClassWithStudentCount) => {
    setSelectedClass(cls);
    setDialogOpen(true);
    setLoadingStudents(true);
    try {
      const students = await getStudentsByClass(cls.id);
      setClassStudents(students);
    } catch {
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  if (!classes || classes.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <School className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">{t.noClasses}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t.noClassesDesc}</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.className2}</TableHead>
              <TableHead>{t.subjectCol}</TableHead>
              <TableHead className="hidden sm:table-cell">{t.responsibleTeacher}</TableHead>
              <TableHead className="text-center">{t.studentsCount}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <TableRow
                key={cls.id}
                className="cursor-pointer hover:bg-primary/5 transition-colors group"
                onClick={() => handleClassClick(cls)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                      <School className="h-4 w-4 text-primary" />
                    </div>
                    <span>{lang === 'en' && cls.name_en ? cls.name_en : cls.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {cls.subject
                    ? <Badge variant="outline">{cls.subject}</Badge>
                    : <span className="text-muted-foreground text-sm">{t.notSpecified}</span>
                  }
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  {cls.teacherName === 'غير معين' || cls.teacherName === 'Unassigned'
                    ? <span className="text-muted-foreground">{t.notAssigned}</span>
                    : cls.teacherName
                  }
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {cls.studentCount}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Students Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {selectedClass && (lang === 'en' && selectedClass.name_en ? selectedClass.name_en : selectedClass?.name)}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t.classStudents} · {classStudents.length} {t.student}
            </p>
          </DialogHeader>
          {loadingStudents ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : classStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            </div>
          ) : (
            <ScrollArea className="h-72 rounded-md border">
              <div className="divide-y">
                {classStudents.map((student, idx) => (
                  <div key={student.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
                      {idx + 1}
                    </div>
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-xs">
                        {(lang === 'en' && student.name_en ? student.name_en : student.name).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {lang === 'en' && student.name_en ? student.name_en : student.name}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
