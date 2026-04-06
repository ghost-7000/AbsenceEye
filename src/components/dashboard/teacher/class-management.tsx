'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, UserPlus, Trash2, Edit, FileText, MoreVertical, Loader2 } from 'lucide-react';
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

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import type { ClassWithStudents } from '@/app/actions/teacher-actions';
import { getTeacherClassesAndStudents, addClass, addStudent, deleteStudent, updateClassName, updateClassNote } from '@/app/actions/teacher-actions';

type StudentInClass = ClassWithStudents['students'][number];

export default function ClassManagement() {
  const { toast } = useToast();
  const [classes, setClasses] = React.useState<ClassWithStudents[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [isAddClassOpen, setAddClassOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const [dialogState, setDialogState] = React.useState<{
    type: 'addStudent' | 'editClass' | 'editNote' | 'deleteStudent' | null;
    classId: string | null;
    studentId?: string;
    studentName?: string;
    isOpen: boolean;
  }>({ type: null, classId: null, isOpen: false });

  const fetchClasses = React.useCallback(async () => {
    setLoading(true);
    try {
      const teacherId = localStorage.getItem('userId');
      if (!teacherId) {
          toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم العثور على المعلم.' });
          setLoading(false);
          return;
      }
      const teacherClasses = await getTeacherClassesAndStudents(teacherId);
      setClasses(teacherClasses);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ في جلب البيانات',
        description: 'فشل تحميل بيانات الصفوف من قاعدة البيانات.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleAddClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);
    const teacherId = localStorage.getItem('userId');
    if (!teacherId) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'معرف المعلم غير موجود.' });
        setIsProcessing(false);
        return;
    }
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('className') as string;
    const subject = formData.get('subject') as string;

    if (!name || !subject) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال اسم الصف والمادة.' });
      setIsProcessing(false);
      return;
    }
    try {
      await addClass(name, subject, teacherId);
      toast({ title: 'نجاح', description: `تم إنشاء صف "${name}" بنجاح.` });
      setAddClassOpen(false);
      form.reset();
      fetchClasses(); // Refresh data
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل الإنشاء', description: 'لم يتمكن من إنشاء الصف.'});
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStudentAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dialogState.classId) return;
    setIsProcessing(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('studentName') as string;
    
    if (!name) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال اسم الطالب.' });
        setIsProcessing(false);
        return;
    }
    
    try {
      await addStudent(name, dialogState.classId);
      const className = classes.find(c => c.id === dialogState.classId)?.name;
      toast({ title: 'نجاح', description: `تمت إضافة الطالب "${name}" إلى صف ${className}.` });
      setDialogState({ type: null, classId: null, isOpen: false });
      form.reset();
      fetchClasses();
    } catch (error) {
       toast({ variant: 'destructive', title: 'فشل الإضافة', description: 'لم يتمكن من إضافة الطالب.'});
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClassAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dialogState.classId) return;
    setIsProcessing(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      if (dialogState.type === 'editClass') {
          const name = formData.get('className') as string;
          if (!name) {
              toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال اسم الصف الجديد.' });
              setIsProcessing(false);
              return;
          }
          await updateClassName(dialogState.classId, name);
          toast({ title: 'نجاح', description: 'تم تحديث اسم الصف.' });
      }

      if (dialogState.type === 'editNote') {
          const note = formData.get('classNote') as string;
          await updateClassNote(dialogState.classId, note);
          toast({ title: 'نجاح', description: 'تم حفظ الملاحظة.' });
      }
      setDialogState({ type: null, classId: null, isOpen: false });
      form.reset();
      fetchClasses();
    } catch (error) {
       toast({ variant: 'destructive', title: 'فشل التحديث', description: 'لم يتمكن من تحديث بيانات الصف.'});
    } finally {
      setIsProcessing(false);
    }
  }

  const handleDeleteStudent = async () => {
    if (dialogState.classId && dialogState.studentId) {
        setIsProcessing(true);
        try {
            await deleteStudent(dialogState.studentId);
            toast({ title: 'نجاح', description: `تم حذف الطالب.` });
            fetchClasses();
        } catch (error) {
            toast({ variant: 'destructive', title: 'فشل الحذف', description: 'لم يتمكن من حذف الطالب.'});
        } finally {
            setIsProcessing(false);
            setDialogState({ type: null, classId: null, isOpen: false });
        }
    }
  }

  const openDialog = (type: 'addStudent' | 'editClass' | 'editNote' | 'deleteStudent', classId: string, studentId?: string, studentName?: string) => {
    setDialogState({ type, classId, studentId, studentName, isOpen: true });
  }

  const findClass = (classId: string | null): ClassWithStudents | undefined => {
    if (!classId) return undefined;
    return classes.find(c => c.id === classId);
  }

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
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
                            <Input id="className" name="className" className="col-span-3" placeholder="مثال: الصف الأول - ج" required/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">المادة</Label>
                            <Input id="subject" name="subject" className="col-span-3" placeholder="مثال: لغة عربية" required/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          إنشاء
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>
      
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(c => {
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
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="secondary">{c.students.length} طالب</Badge>
                    {c.subject && <Badge variant="outline">{c.subject}</Badge>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    {c.note && (
                        <div className="mb-4 text-xs p-3 bg-accent/50 rounded-md border border-dashed">
                            <p className="font-semibold mb-1">ملاحظة:</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{c.note}</p>
                        </div>
                    )}
                  <div className="border rounded-md max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الطالب</TableHead>
                        <TableHead className="text-end">حذف</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {c.students.length > 0 ? (
                            c.students.map((student: StudentInClass) => (
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
                  </div>
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
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          إضافة الطالب
                        </Button>
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
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          حفظ التغييرات
                        </Button>
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
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          حفظ الملاحظة
                        </Button>
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
                    <Button variant="destructive" onClick={handleDeleteStudent} disabled={isProcessing}>
                      {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                      حذف
                    </Button>
                </DialogFooter>
                </>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}
