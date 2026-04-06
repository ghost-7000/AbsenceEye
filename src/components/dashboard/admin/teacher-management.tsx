'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle, Loader2, Search, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Teacher } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from '@/app/actions/admin-actions';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';
import { useLanguage, getLocalizedName, useTranslation } from '@/components/language-provider';

// Schemas for form validation
const addTeacherSchema = z.object({
  name: z.string().min(2, { message: 'الاسم مطلوب' }),
  email: z.string().email({ message: 'بريد إلكتروني غير صالح' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
  subject: z.string().min(2, { message: 'المادة مطلوبة' }),
});

const editTeacherSchema = z.object({
  name: z.string().min(2, { message: 'الاسم مطلوب' }),
  email: z.string().email({ message: 'بريد إلكتروني غير صالح' }),
  subject: z.string().min(2, { message: 'المادة مطلوبة' }),
});

export default function TeacherManagement({ initialTeachers }: { initialTeachers: Teacher[]}) {
  const { lang } = useLanguage();
  const t = useTranslation();
  const { toast } = useToast();
  const [teachers, setTeachers] = React.useState<Teacher[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // State for controlling dialogs
  const [dialog, setDialog] = React.useState<{
    type: 'add' | 'edit' | 'delete' | null;
    teacher?: Teacher;
  }>({ type: null });

  const addForm = useForm<z.infer<typeof addTeacherSchema>>({
    resolver: zodResolver(addTeacherSchema),
    defaultValues: { name: '', email: '', password: '', subject: '' },
  });

  const editForm = useForm<z.infer<typeof editTeacherSchema>>({
    resolver: zodResolver(editTeacherSchema),
  });

  const fetchTeachers = React.useCallback(async () => {
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث قائمة المعلمات.'});
    }
  }, [toast]);
  
  const isProcessing = addForm.formState.isSubmitting || editForm.formState.isSubmitting;

  const filteredTeachers = React.useMemo(() => 
    teachers.filter(
        teacher =>
        getLocalizedName({ name: teacher.name, name_en: teacher.name_en }, lang).toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (teacher.subject && teacher.subject.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    ), [teachers, debouncedSearchTerm, lang]);


  const handleAddSubmit = async (values: z.infer<typeof addTeacherSchema>) => {
    try {
      await addTeacher(values);
      toast({ title: 'نجاح', description: `تمت إضافة المعلمة ${values.name} بنجاح.` });
      await fetchTeachers(); 
      setDialog({ type: null });
      addForm.reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل الإضافة', description: 'حدث خطأ أثناء إضافة المعلمة.'});
    }
  };

  const handleEditSubmit = async (values: z.infer<typeof editTeacherSchema>) => {
    if (!dialog.teacher) return;
    try {
      await updateTeacher(dialog.teacher.id, values);
      toast({ title: 'نجاح', description: `تم تعديل بيانات المعلمة ${values.name} بنجاح.` });
      await fetchTeachers();
      setDialog({ type: null });
    } catch (error) {
       toast({ variant: 'destructive', title: 'فشل التعديل', description: 'حدث خطأ أثناء تعديل البيانات.'});
    }
  };

  const handleDelete = async () => {
    if (!dialog.teacher) return;
    try {
      await deleteTeacher(dialog.teacher.id);
      toast({ title: 'نجاح', description: `تم حذف المعلمة ${dialog.teacher.name} بنجاح.` });
      await fetchTeachers();
      setDialog({ type: null });
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل الحذف', description: 'حدث خطأ أثناء حذف المعلمة.'});
    }
  };

  const openDialog = (type: 'add' | 'edit' | 'delete', teacher?: Teacher) => {
    if (type === 'edit' && teacher) {
      editForm.reset({
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject || '',
      });
    } else if (type === 'add') {
      addForm.reset();
    }
    setDialog({ type, teacher });
  };
  
  const isDialogOpen = dialog.type !== null;
  const closeDialog = () => setDialog({ type: null });

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="بحث بالاسم، البريد، أو المادة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>
            <Button size="sm" className="gap-1 w-full sm:w-auto" onClick={() => openDialog('add')}>
                <PlusCircle className="h-4 w-4" />
                <span>إضافة معلمة جديدة</span>
            </Button>
        </div>
      <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>المادة</TableHead>
                <TableHead className="hidden sm:table-cell">البريد الإلكتروني</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map(teacher => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={teacher.avatarUrl || undefined} alt={getLocalizedName({ name: teacher.name, name_en: teacher.name_en }, lang)} />
                          <AvatarFallback>{getLocalizedName({ name: teacher.name, name_en: teacher.name_en }, lang).charAt(0)}</AvatarFallback>
                        </Avatar>
                        {getLocalizedName({ name: teacher.name, name_en: teacher.name_en }, lang)}
                      </div>
                    </TableCell>
                     <TableCell>
                      {teacher.subject ? <Badge variant="outline">{teacher.subject}</Badge> : 'غير محدد'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{teacher.email}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => openDialog('edit', teacher)}>تعديل</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => openDialog('delete', teacher)}>
                                حذف
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <Users className="h-12 w-12 text-muted-foreground" />
                        <h3 className="font-semibold">لم يتم العثور على معلمات</h3>
                        <p className="text-muted-foreground text-sm">
                            {searchTerm ? 'جرّب كلمة بحث أخرى.' : 'ابدأ بإضافة معلمة جديدة.'}
                        </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Universal Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
            <DialogContent>
                {dialog.type === 'add' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>إضافة معلمة جديدة</DialogTitle>
                            <DialogDescription>
                                أدخل بيانات المعلمة الجديدة. سيتم إنشاء حساب لها لتسجيل الدخول.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...addForm}>
                            <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4 pt-4">
                                <FormField control={addForm.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input placeholder="مثال: نورة عبدالله" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={addForm.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input type="email" placeholder="example@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={addForm.control} name="password" render={({ field }) => (
                                    <FormItem><FormLabel>كلمة المرور</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={addForm.control} name="subject" render={({ field }) => (
                                    <FormItem><FormLabel>المادة</FormLabel><FormControl><Input placeholder="مثال: لغة عربية" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={closeDialog}>إلغاء</Button>
                                    <Button type="submit" disabled={isProcessing}>
                                        {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin"/>}
                                        إضافة معلمة
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </>
                )}
                 {dialog.type === 'edit' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>تعديل بيانات المعلمة</DialogTitle>
                             <DialogDescription>
                                تعديل بيانات المعلمة: {dialog.teacher?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...editForm}>
                            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 pt-4">
                                <FormField control={editForm.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={editForm.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={editForm.control} name="subject" render={({ field }) => (
                                    <FormItem><FormLabel>المادة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={closeDialog}>إلغاء</Button>
                                    <Button type="submit" disabled={isProcessing}>
                                        {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin"/>}
                                        حفظ التعديلات
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </>
                )}
                {dialog.type === 'delete' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>تأكيد الحذف</DialogTitle>
                            <DialogDescription>
                                هل أنت متأكد من رغبتك في حذف حساب المعلمة {dialog.teacher?.name}؟ لا يمكن التراجع عن هذا الإجراء.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="ghost" onClick={closeDialog}>إلغاء</Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
                               {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin"/>}
                               حذف
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
