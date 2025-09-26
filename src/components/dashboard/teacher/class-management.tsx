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
import { PlusCircle, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useClasses } from '@/context/class-context';

import type { Student } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ClassManagement() {
  const { toast } = useToast();
  const { teacherClasses, getStudentsByClass, addClass, addStudent } = useClasses();
  
  const [isAddClassOpen, setAddClassOpen] = React.useState(false);
  const [isAddStudentOpen, setAddStudentOpen] = React.useState(false);
  const [selectedClassForStudent, setSelectedClassForStudent] = React.useState<string>('');

  
  const handleAddClass = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('className') as string;

    if (!name) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال اسم الصف.' });
      return;
    }
    addClass(name);
    toast({ title: 'نجاح', description: `تم إنشاء صف "${name}" بنجاح.` });
    setAddClassOpen(false);
    form.reset();
  };

  const handleAddStudent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('studentName') as string;

    if (!name || !selectedClassForStudent) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال اسم الطالب واختيار الصف.' });
      return;
    }
    
    addStudent(name, selectedClassForStudent);
    const className = teacherClasses.find(c => c.id === selectedClassForStudent)?.name;
    toast({ title: 'نجاح', description: `تمت إضافة الطالب "${name}" إلى صف ${className}.` });
    setAddStudentOpen(false);
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>إدارة الصفوف والطلاب</CardTitle>
                <CardDescription>عرض وتعديل الطلاب في صفوفك.</CardDescription>
            </div>
            <Dialog open={isAddClassOpen} onOpenChange={setAddClassOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        إنشاء صف جديد
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إنشاء صف جديد</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddClass}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="className" className="text-right">اسم الصف</Label>
                                <Input id="className" name="className" className="col-span-3" placeholder="مثال: الصف الأول - ج"/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">إنشاء</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {teacherClasses.length > 0 ? (
        <Accordion type="single" collapsible className="w-full" defaultValue={teacherClasses[0]?.id}>
          {teacherClasses.map(c => {
            const students: Student[] = getStudentsByClass(c.id);
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
                       <Dialog open={isAddStudentOpen && selectedClassForStudent === c.id} onOpenChange={(isOpen) => { if (!isOpen) setSelectedClassForStudent(''); setAddStudentOpen(isOpen);}}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1" onClick={() => { setSelectedClassForStudent(c.id); setAddStudentOpen(true);}}>
                                    <UserPlus className="h-4 w-4" />
                                    إضافة طالب
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>إضافة طالب جديد إلى {c.name}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddStudent}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="studentName" className="text-right">اسم الطالب</Label>
                                            <Input id="studentName" name="studentName" className="col-span-3" placeholder="الاسم الكامل للطالب"/>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">إضافة الطالب</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الطالب</TableHead>
                          <TableHead className="text-end">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map(student => (
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
                            <TableCell className="text-end">
                              <Button variant="ghost" size="icon" disabled>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">حذف</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                         {students.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                لا يوجد طلاب في هذا الصف.
                                </TableCell>
                            </TableRow>
                         )}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        ) : (
             <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center">
                <h3 className="text-lg font-medium">لا توجد صفوف دراسية</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    ابدأ بإنشاء صف جديد لإضافة الطلاب وإدارة الحضور.
                </p>
             </div>
        )}
      </CardContent>
    </Card>
  );
}