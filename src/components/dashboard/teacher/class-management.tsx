'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, UserPlus, Trash2, Edit, FileText, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClasses } from '@/context/class-context';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import type { Class } from '@/lib/types';


export default function ClassManagement() {
  const { toast } = useToast();
  const { teacherClasses, getStudentsByClass, addClass, addStudent, deleteStudent, updateClassNote, updateClassName } = useClasses();
  
  const [isAddClassOpen, setAddClassOpen] = React.useState(false);

  const [dialogState, setDialogState] = React.useState<{
    type: 'addStudent' | 'editClass' | 'editNote' | 'deleteStudent' | null;
    classId: string | null;
    studentId?: string;
    studentName?: string;
    isOpen: boolean;
  }>({ type: null, classId: null, isOpen: false });

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

  const handleStudentAction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dialogState.classId) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('studentName') as string;
    
    if (!name) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال اسم الطالب.' });
        return;
    }

    addStudent(name, dialogState.classId);
    const className = teacherClasses.find(c => c.id === dialogState.classId)?.name;
    toast({ title: 'نجاح', description: `تمت إضافة الطالب "${name}" إلى صف ${className}.` });
    setDialogState({ type: null, classId: null, isOpen: false });
    form.reset();
  };

  const handleClassAction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dialogState.classId) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (dialogState.type === 'editClass') {
        const name = formData.get('className') as string;
        if (!name) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال اسم الصف الجديد.' });
            return;
        }
        updateClassName(dialogState.classId, name);
        toast({ title: 'نجاح', description: 'تم تحديث اسم الصف.' });
    }

    if (dialogState.type === 'editNote') {
        const note = formData.get('classNote') as string;
        updateClassNote(dialogState.classId, note);
        toast({ title: 'نجاح', description: 'تم حفظ الملاحظة.' });
    }

    setDialogState({ type: null, classId: null, isOpen: false });
    form.reset();
  }

  const handleDeleteStudent = () => {
    if (dialogState.classId && dialogState.studentId) {
        deleteStudent(dialogState.studentId, dialogState.classId);
        toast({ title: 'نجاح', description: `تم حذف الطالب.` });
    }
    setDialogState({ type: null, classId: null, isOpen: false });
  }

  const openDialog = (type: 'addStudent' | 'editClass' | 'editNote' | 'deleteStudent', classId: string, studentId?: string, studentName?: string) => {
    setDialogState({ type, classId, studentId, studentName, isOpen: true });
  }

  const findClass = (classId: string | null): Class | undefined => {
    if (!classId) return undefined;
    return teacherClasses.find(c => c.id === classId);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-2xl font-bold md:text-3xl">صفوفي</h1>
            <p className="text-muted-foreground">عرض وتعديل الطلاب في صفوفك.</p>
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
      
      {teacherClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherClasses.map(c => {
            const students = getStudentsByClass(c.id);
            return (
              <Card key={c.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openDialog('editClass', c.id)}>
                          <Edit className="w-4 h-4 ml-2" /> تعديل اسم الصف
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => openDialog('editNote', c.id)}>
                          <FileText className="w-4 h-4 ml-2" /> تعديل الملاحظة
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>
                    <Badge variant="secondary">{students.length} طالب</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    {c.note && (
                        <div className="mb-4 text-xs p-3 bg-accent/50 rounded-md border border-dashed">
                            <p className="font-semibold mb-1">ملاحظة:</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{c.note}</p>
                        </div>
                    )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الطالب</TableHead>
                        <TableHead className="text-end">حذف</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.length > 0 ? (
                            students.map(student => (
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
                                    <Button variant="ghost" size="icon" onClick={() => openDialog('deleteStudent', c.id, student.id, student.name)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">حذف</span>
                                    </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                    لا يوجد طلاب في هذا الصف.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => openDialog('addStudent', c.id)}>
                        <UserPlus className="h-4 w-4 ml-2" />
                        إضافة طالب جديد
                    </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center mt-6">
            <h3 className="text-lg font-medium">لا توجد صفوف دراسية</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                ابدأ بإنشاء صف جديد لإضافة الطلاب وإدارة الحضور.
            </p>
        </div>
      )}

    {/* Dialogs for all actions */}
    <Dialog open={dialogState.isOpen} onOpenChange={(isOpen) => setDialogState(prev => ({...prev, isOpen}))}>
        <DialogContent>
            {dialogState.type === 'addStudent' && (
                <>
                <DialogHeader>
                    <DialogTitle>إضافة طالب جديد إلى {findClass(dialogState.classId)?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleStudentAction}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="studentName">اسم الطالب</Label>
                        <Input id="studentName" name="studentName" placeholder="الاسم الكامل للطالب"/>
                    </div>
                    <DialogFooter>
                        <Button type="submit">إضافة الطالب</Button>
                    </DialogFooter>
                </form>
                </>
            )}
            {dialogState.type === 'editClass' && (
                 <>
                <DialogHeader>
                    <DialogTitle>تعديل اسم الصف</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleClassAction}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="className">اسم الصف الجديد</Label>
                        <Input id="className" name="className" defaultValue={findClass(dialogState.classId)?.name} />
                    </div>
                    <DialogFooter>
                        <Button type="submit">حفظ التغييرات</Button>
                    </DialogFooter>
                </form>
                </>
            )}
            {dialogState.type === 'editNote' && (
                 <>
                <DialogHeader>
                    <DialogTitle>إضافة أو تعديل ملاحظة لصف {findClass(dialogState.classId)?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleClassAction}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="classNote">الملاحظة</Label>
                        <Textarea id="classNote" name="classNote" defaultValue={findClass(dialogState.classId)?.note || ''} rows={5}/>
                    </div>
                    <DialogFooter>
                        <Button type="submit">حفظ الملاحظة</Button>
                    </DialogFooter>
                </form>
                </>
            )}
            {dialogState.type === 'deleteStudent' && (
                <>
                <DialogHeader>
                    <DialogTitle>تأكيد الحذف</DialogTitle>
                     <DialogDescription>
                        هل أنت متأكد من رغبتك في حذف الطالب "{dialogState.studentName}" من هذا الصف؟
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogState(prev => ({...prev, isOpen: false}))}>إلغاء</Button>
                    <Button variant="destructive" onClick={handleDeleteStudent}>حذف</Button>
                </DialogFooter>
                </>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}
