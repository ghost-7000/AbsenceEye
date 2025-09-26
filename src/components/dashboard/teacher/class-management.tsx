'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, PlusCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { students as allStudents, classes as allClasses } from '@/lib/data';
import type { Student, Class } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function ClassManagement() {
  const teacherId = '2'; // Mock teacher ID
  const [teacherClasses] = React.useState<Class[]>(
    allClasses.filter(c => c.teacherId === teacherId)
  );

  const getStudentsByClass = (classId: string) => {
    return allStudents.filter(s => s.classId === classId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>إدارة الصفوف والطلاب</CardTitle>
                <CardDescription>عرض وتعديل الطلاب في صفوفك.</CardDescription>
            </div>
             <Button size="sm" className="gap-1" disabled>
                <PlusCircle className="h-4 w-4" />
                إنشاء صف جديد
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue={teacherClasses[0]?.id}>
          {teacherClasses.map(c => {
            const students = getStudentsByClass(c.id);
            return (
              <AccordionItem value={c.id} key={c.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-4">
                    <span className="font-semibold text-lg">{c.name}</span>
                    <Badge variant="secondary">{students.length} طالب</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="mb-4 flex justify-end">
                        <Button variant="outline" size="sm" className="gap-1" disabled>
                            <UserPlus className="h-4 w-4" />
                            إضافة طالب
                        </Button>
                    </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الطالب</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map(student => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="avatar abstract" />
                                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{student.name}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem disabled>تعديل</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" disabled>حذف</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
