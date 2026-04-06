'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, UserPlus, Trash2, Edit, FileText, MoreVertical, Loader2, School } from 'lucide-react';
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
import type { ClassWithStudentCount } from '@/app/actions/admin-actions';
import {
    getClassesWithStudentCounts,
    addClassAdmin,
    deleteClassAdmin,
    updateClassAdmin,
    updateClassNoteAdmin,
    addStudentAdmin,
    updateStudentAdmin,
    deleteStudentAdmin,
    getTeachers
} from '@/app/actions/admin-actions';
import type { Teacher } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ClassManagement({ initialClasses }: { initialClasses: ClassWithStudentCount[] }) {
  const { toast } = useToast();
  const [classes, setClasses] = React.useState<ClassWithStudentCount[]>(initialClasses);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const [isAddClassOpen, setAddClassOpen] = React.useState(false);

  const [dialogState, setDialogState] = React.useState<{
    type: 'addStudent' | 'editClass' | 'editNote' | 'deleteStudent' | 'deleteClass' | 'editStudent' | null;
    classId: string | null;
    studentId?: string;
    studentName?: string;
    isOpen: boolean;
  }>({ type: null, classId: null, isOpen: false });

  const fetchClasses = React.useCallback(async () => {
    try {
      const cls = await getClassesWithStudentCounts();
      setClasses(cls);
    } catch (error) {
      console.error(error);
    }
  }, []);

  React.useEffect(() => {
    getTeachers().then(setTeachers).catch(console.error);
  }, []);

  const handleAddClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);
    
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('className') as string;
    const subject = formData.get('subject') as string;
    const teacherId = formData.get('teacherId') as string;

    if (!name || !subject || !teacherId) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال جميع البيانات المطلوبة.' });
      setIsProcessing(false);
      return;
    }
    try {
      await addClassAdmin(name, subject, teacherId);
      toast({ title: 'نجاح', description: `تم إنشاء صف "${name}" بنجاح.` });
      setAddClassOpen(false);
      form.reset();
      fetchClasses();
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
      if (dialogState.type === 'editStudent' && dialogState.studentId) {
          await updateStudentAdmin(dialogState.studentId, name);
          toast({ title: 'نجاح', description: `تم تعديل اسم الطالب بنجاح.` });
      } else {
          await addStudentAdmin(name, dialogState.classId);
          const className = classes.find(c => c.id === dialogState.classId)?.name;
          toast({ title: 'نجاح', description: `تمت إضافة الطالب "${name}" إلى صف ${className}.` });
      }
      setDialogState({ type: null, classId: null, isOpen: false });
      form.reset();
      fetchClasses();
    } catch (error) {
       toast({ variant: 'destructive', title: 'فشل العملية', description: 'حدث خطأ غير متوقع.'});
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
          if (!name) throw new Error('الرجاء إدخال اسم الصف الجديد.');
          await updateClassAdmin(dialogState.classId, name);
          toast({ title: 'نجاح', description: 'تم تحديث اسم الصف.' });
      }

      if (dialogState.type === 'editNote') {
          const note = formData.get('classNote') as string;
          await updateClassNoteAdmin(dialogState.classId, note);
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
            await deleteStudentAdmin(dialogState.studentId);
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

  const handleDeleteClass = async () => {
    if (dialogState.classId) {
        setIsProcessing(true);
        try {
            await deleteClassAdmin(dialogState.classId);
            toast({ title: 'نجاح', description: `تم حذف الصف بالكامل بنجاح.` });
            fetchClasses();
        } catch (error) {
            toast({ variant: 'destructive', title: 'فشل الحذف', description: 'حدث خطأ أثناء الـحذف.'});
        } finally {
            setIsProcessing(false);
            setDialogState({ type: null, classId: null, isOpen: false });
        }
    }
  }

  const openDialog = (type: 'addStudent' | 'editClass' | 'editNote' | 'deleteStudent' | 'deleteClass' | 'editStudent', classId: string, studentId?: string, studentName?: string) => {
    setDialogState({ type, classId, studentId, studentName, isOpen: true });
  }

  const findClass = (classId: string | null): ClassWithStudentCount | undefined => {
    if (!classId) return undefined;
    return classes.find(c => c.id === classId);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Dialog open={isAddClassOpen} onOpenChange={setAddClassOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1 bg-primary text-white hover:bg-primary/90 rounded-md">
                    <PlusCircle className="h-4 w-4" />
                    إنشاء صف جديد (لأي معلم)
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="teacherId" className="text-right">المعلم المـُشرف</Label>
                            <div className="col-span-3">
                                <Select name="teacherId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر المعلم..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name} ({t.subject})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          إنشاء الصف
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>
      
      {classes.length > 0 ? (
        <div className="flex flex-col gap-6">
          {classes.map(c => {
            return (
              <Card key={c.id} className="w-full shadow-sm hover:shadow-md transition-shadow border-primary/10">
                <CardHeader className="bg-muted/20 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl text-primary font-bold">{c.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                            <span className="font-semibold text-foreground">طاقم التدريس: {c.teacherName}</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none">{c.students?.length || 0} طالباً</Badge>
                            {c.subject && <Badge variant="outline">{c.subject}</Badge>}
                        </CardDescription>
                    </div>
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/20 hover:bg-primary hover:text-white">
                                    <Edit className="h-4 w-4" /> إدارة وتعديل
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => openDialog('editClass', c.id)}>
                                <Edit className="w-4 h-4 ml-2" /> تعديل اسم الصف
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => openDialog('editNote', c.id)}>
                                <FileText className="w-4 h-4 ml-2" /> تعديل الملاحظة
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => openDialog('deleteClass', c.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 ml-2" /> حذف الصف بالكامل
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {c.note && (
                        <div className="mb-4 text-xs p-3 bg-blue-50/50 text-blue-900 rounded-md border border-blue-100">
                            <p className="font-bold mb-1">ملاحظة إدارية:</p>
                            <p className="whitespace-pre-wrap">{c.note}</p>
                        </div>
                    )}
                  
                  <div className="flex items-center justify-between mb-3 border-b pb-2">
                     <h4 className="font-semibold text-sm">قائمة الطلاب المدرجين</h4>
                     <Button variant="ghost" size="sm" className="text-primary hover:text-primary h-8" onClick={() => openDialog('addStudent', c.id)}>
                        <UserPlus className="h-4 w-4 ml-2" /> أضف طالباً لهذا الصف
                     </Button>
                  </div>
                  
                  <div className="border rounded-md max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10 hidden sm:table-header-group">
                      <TableRow>
                        <TableHead>الرقم</TableHead>
                        <TableHead>اسم الطالب</TableHead>
                        <TableHead className="text-end">الإجراءات (المديرة)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {c.students && c.students.length > 0 ? (
                            c.students.map((student, index) => (
                                <TableRow key={student.id} className="hover:bg-muted/20">
                                    <TableCell className="w-12 text-muted-foreground hidden sm:table-cell">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-7 w-7 sm:h-9 sm:w-9 border border-primary/10">
                                                <AvatarImage src={student.avatarUrl || undefined} alt={student.name} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs">{student.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-semibold text-sm sm:text-base">{student.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-end">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => openDialog('editStudent', c.id, student.id, student.name)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50 transition-colors" onClick={() => openDialog('deleteStudent', c.id, student.id, student.name)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    لا يوجد طلاب في هذا الصف حتى الآن.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 p-12 text-center mt-6 bg-muted/10">
             <School className="h-12 w-12 text-primary/40 mb-4" />
            <h3 className="text-lg font-bold text-foreground">المنصة بانتظار صفوفها!</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                بصفتك المديرة، لك الصلاحية المطلقة لإنشاء كافة الصفوف في المدرسة هنا وتوزيعها على المعلمات فوراً.
            </p>
        </div>
      )}

    {/* Master Dialog Formats */}
    <Dialog open={dialogState.isOpen} onOpenChange={(isOpen) => setDialogState(prev => ({...prev, isOpen}))}>
        <DialogContent>
            {dialogState.type === 'addStudent' && (
                <>
                <DialogHeader>
                    <DialogTitle>إضافة طالب جديد لـ "{findClass(dialogState.classId)?.name}"</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleStudentAction}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="studentName" className="font-bold">اسم الطالب</Label>
                        <Input id="studentName" name="studentName" placeholder="الاسم الكامل"/>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isProcessing} className="bg-primary text-white hover:bg-primary/90">
                          {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          تأكيد الإضافة
                        </Button>
                    </DialogFooter>
                </form>
                </>
            )}
            {dialogState.type === 'editClass' && (
                 <>
                <DialogHeader>
                    <DialogTitle>تعديل بيانات الصف</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleClassAction}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="className" className="font-bold">اسم الصف الجديد</Label>
                        <Input id="className" name="className" defaultValue={findClass(dialogState.classId)?.name} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isProcessing} className="bg-primary hover:bg-primary/90">
                          {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          حفظ التعديل
                        </Button>
                    </DialogFooter>
                </form>
                </>
            )}
            {dialogState.type === 'editNote' && (
                 <>
                <DialogHeader>
                    <DialogTitle>ملاحظة المديرة</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleClassAction}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="classNote" className="font-bold">ملاحظة على هذا الصف</Label>
                        <Textarea id="classNote" name="classNote" defaultValue={findClass(dialogState.classId)?.note || ''} rows={4} placeholder="ملاحظات تفصيلية، أمور إدارية، ..."/>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          حفظ باللوحة
                        </Button>
                    </DialogFooter>
                </form>
                </>
            )}
            {dialogState.type === 'deleteStudent' && (
                <>
                <DialogHeader>
                    <DialogTitle className="text-red-600 font-bold">صلاحية المديرة: طرد/حذف طالب</DialogTitle>
                     <DialogDescription className="mt-3 leading-relaxed text-foreground">
                        هل أنت متأكدة من شطب اسم الطالب <strong>{dialogState.studentName}</strong>؟ <br/>
                        سيختفي الطالب من منصة المعلمة بالكامل.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2">
                    <Button variant="outline" onClick={() => setDialogState(prev => ({...prev, isOpen: false}))}>تراجع</Button>
                    <Button variant="destructive" onClick={handleDeleteStudent} disabled={isProcessing}>
                      {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                      تأكيد الحذف النهائي
                    </Button>
                </DialogFooter>
                </>
            )}
            {dialogState.type === 'deleteClass' && (
                <>
                <DialogHeader>
                    <DialogTitle className="text-red-700 font-extrabold text-2xl mb-2 flex items-center gap-2">
                        <Trash2 className="h-6 w-6"/> خطر الحذف الكامل
                    </DialogTitle>
                     <DialogDescription className="text-base leading-relaxed font-medium">
                        هذا إجراء إداري حاسم من المدريرة. حذف صف <strong>{findClass(dialogState.classId)?.name}</strong> يعني التفريغ الكامل للبيانات التالية:
                        <ul className="list-disc leading-8 mr-6 mt-3 text-red-900/80 bg-red-50 p-4 border border-red-100 rounded-md">
                            <li>تسجيلات حضور وغياب هذا الصف من جداول النظام.</li>
                            <li>شطب كافة أسماء طلاب هذا الصف تماماً.</li>
                            <li>سحب الصف من منصة معلمته <strong>{findClass(dialogState.classId)?.teacherName}</strong>.</li>
                        </ul>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="outline" className="h-11" onClick={() => setDialogState(prev => ({...prev, isOpen: false}))}>إلغاء الأمر</Button>
                    <Button variant="destructive" className="h-11 font-bold text-md shadow-lg shadow-red-500/20" onClick={handleDeleteClass} disabled={isProcessing}>
                      {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                      نعم، أمر بالحذف النهائي
                    </Button>
                </DialogFooter>
                </>
            )}
            {dialogState.type === 'editStudent' && (
                <>
                <DialogHeader>
                    <DialogTitle>تعديل اسم الطالب إدارياً</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleStudentAction}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="studentName" className="font-bold">تصحيح الاسم</Label>
                        <Input id="studentName" name="studentName" defaultValue={dialogState.studentName} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          تنفيذ التعديل
                        </Button>
                    </DialogFooter>
                </form>
                </>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}
