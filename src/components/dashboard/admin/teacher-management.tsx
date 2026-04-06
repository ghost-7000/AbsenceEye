'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle, Loader2, Search, Users, School, ChevronRight, ArrowRight, X, UserCheck, ArrowLeft } from 'lucide-react';
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
import { getTeachers, addTeacher, updateTeacher, deleteTeacher, getTeacherClassesForAdmin } from '@/app/actions/admin-actions';
import type { ClassWithStudents } from '@/app/actions/admin-actions';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';
import { useTranslation, useLanguage } from '@/components/language-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const addTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  subject: z.string().min(2),
});

const editTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
});

export default function TeacherManagement({ initialTeachers }: { initialTeachers: Teacher[] }) {
  const { toast } = useToast();
  const t = useTranslation();
  const { lang } = useLanguage();
  const [teachers, setTeachers] = React.useState<Teacher[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Main CRUD dialog
  const [dialog, setDialog] = React.useState<{
    type: 'add' | 'edit' | 'delete' | null;
    teacher?: Teacher;
  }>({ type: null });

  // Teacher detail panel: shows classes → students
  const [detailTeacher, setDetailTeacher] = React.useState<Teacher | null>(null);
  const [teacherClasses, setTeacherClasses] = React.useState<ClassWithStudents[]>([]);
  const [loadingClasses, setLoadingClasses] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState<ClassWithStudents | null>(null);

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
    } catch {
      toast({ variant: 'destructive', title: t.addTeacherFail, description: t.addTeacherFailDesc });
    }
  }, [toast, t]);

  const isProcessing = addForm.formState.isSubmitting || editForm.formState.isSubmitting;

  const filteredTeachers = React.useMemo(() =>
    teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (teacher.subject && teacher.subject.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    ), [teachers, debouncedSearchTerm]);

  const handleAddSubmit = async (values: z.infer<typeof addTeacherSchema>) => {
    try {
      await addTeacher(values);
      toast({ title: t.teacherAdded, description: t.teacherAddedDesc });
      await fetchTeachers();
      setDialog({ type: null });
      addForm.reset();
    } catch {
      toast({ variant: 'destructive', title: t.addTeacherFail, description: t.addTeacherFailDesc });
    }
  };

  const handleEditSubmit = async (values: z.infer<typeof editTeacherSchema>) => {
    if (!dialog.teacher) return;
    try {
      await updateTeacher(dialog.teacher.id, values);
      toast({ title: t.teacherUpdated, description: t.teacherUpdatedDesc });
      await fetchTeachers();
      setDialog({ type: null });
    } catch {
      toast({ variant: 'destructive', title: t.editTeacherFail, description: t.editTeacherFailDesc });
    }
  };

  const handleDelete = async () => {
    if (!dialog.teacher) return;
    try {
      await deleteTeacher(dialog.teacher.id);
      toast({ title: t.teacherDeleted, description: t.teacherDeletedDesc });
      await fetchTeachers();
      setDialog({ type: null });
      if (detailTeacher?.id === dialog.teacher.id) setDetailTeacher(null);
    } catch {
      toast({ variant: 'destructive', title: t.deleteTeacherFail, description: t.deleteTeacherFailDesc });
    }
  };

  const openDialog = (type: 'add' | 'edit' | 'delete', teacher?: Teacher) => {
    if (type === 'edit' && teacher) {
      editForm.reset({ name: teacher.name, email: teacher.email, subject: teacher.subject || '' });
    } else if (type === 'add') {
      addForm.reset();
    }
    setDialog({ type, teacher });
  };

  const openTeacherDetail = async (teacher: Teacher) => {
    setDetailTeacher(teacher);
    setSelectedClass(null);
    setLoadingClasses(true);
    try {
      const classes = await getTeacherClassesForAdmin(teacher.id);
      setTeacherClasses(classes);
    } catch {
      setTeacherClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const isDialogOpen = dialog.type !== null;
  const closeDialog = () => setDialog({ type: null });

  const getTeacherInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : name[0];
  };

  const getDisplayName = (teacher: Teacher) => teacher.name;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Teachers List – Left/Right panel */}
      <div className={`space-y-4 ${detailTeacher ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchByNameEmailSubject}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-9"
            />
          </div>
          <Button size="sm" className="gap-1 w-full sm:w-auto" onClick={() => openDialog('add')}>
            <PlusCircle className="h-4 w-4" />
            <span>{t.addNewTeacher}</span>
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.teacherName}</TableHead>
                {!detailTeacher && <TableHead>{t.subject}</TableHead>}
                {!detailTeacher && <TableHead className="hidden md:table-cell">{t.email}</TableHead>}
                <TableHead>
                  <span className="sr-only">{t.actions}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map(teacher => (
                  <TableRow
                    key={teacher.id}
                    className={`cursor-pointer transition-colors hover:bg-primary/5 ${detailTeacher?.id === teacher.id ? 'bg-primary/10 border-s-2 border-s-primary' : ''}`}
                    onClick={() => openTeacherDetail(teacher)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={teacher.avatarUrl || undefined} alt={teacher.name} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                            {getTeacherInitials(teacher.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-sm">{getDisplayName(teacher)}</div>
                          {detailTeacher && (
                            <div className="text-xs text-muted-foreground truncate">{teacher.subject || t.notSpecified}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {!detailTeacher && (
                      <TableCell>
                        {teacher.subject ? <Badge variant="outline">{teacher.subject}</Badge> : <span className="text-muted-foreground text-sm">{t.notSpecified}</span>}
                      </TableCell>
                    )}
                    {!detailTeacher && (
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{teacher.email}</TableCell>
                    )}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">{t.actions}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => openDialog('edit', teacher)}>{t.edit}</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => openDialog('delete', teacher)}>
                              {t.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={detailTeacher ? 2 : 4} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Users className="h-12 w-12 text-muted-foreground" />
                      <h3 className="font-semibold">{t.noTeachersFound}</h3>
                      <p className="text-muted-foreground text-sm">
                        {searchTerm ? t.noTeachersSearch : t.noTeachersStart}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Panel – shows when teacher is selected */}
      {detailTeacher && (
        <div className="lg:col-span-3 space-y-4 animate-in slide-in-from-end-4 duration-300">
          {/* Teacher Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={detailTeacher.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {getTeacherInitials(detailTeacher.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg leading-tight">{getDisplayName(detailTeacher)}</h3>
                <p className="text-sm text-muted-foreground">{detailTeacher.subject || t.notSpecified}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setDetailTeacher(null); setSelectedClass(null); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Class → Students Drill Down */}
          {!selectedClass ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <School className="h-4 w-4 text-primary" />
                  {t.teacherClasses}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t.teacherClassesDesc}</p>
              </CardHeader>
              <CardContent>
                {loadingClasses ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : teacherClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-3 text-center">
                    <School className="h-10 w-10 text-muted-foreground/50" />
                    <div>
                      <p className="font-medium text-sm">{t.noClassesForTeacher}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.noClassesForTeacherDesc}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {teacherClasses.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => setSelectedClass(cls)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-start group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <School className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {lang === 'en' && cls.name_en ? cls.name_en : cls.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {cls.subject || t.notSpecified} · {cls.students.length} {t.student}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{cls.students.length}</Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedClass(null)}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {lang === 'en' && selectedClass.name_en ? selectedClass.name_en : selectedClass.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{t.classStudents} · {selectedClass.students.length} {t.student}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {selectedClass.students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-3 text-center px-4">
                    <Users className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t.noData}</p>
                  </div>
                ) : (
                  <ScrollArea className="h-72">
                    <div className="divide-y">
                      {selectedClass.students.map((student, idx) => (
                        <div key={student.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
                            {idx + 1}
                          </div>
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarImage src={student.avatarUrl || undefined} />
                            <AvatarFallback className="text-xs">{(lang === 'en' && student.name_en ? student.name_en : student.name).charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate">
                            {lang === 'en' && student.name_en ? student.name_en : student.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Universal CRUD Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)]">
          {dialog.type === 'add' && (
            <>
              <DialogHeader>
                <DialogTitle>{t.addNewTeacher}</DialogTitle>
                <DialogDescription>{t.addNewTeacherDesc}</DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4 pt-2">
                  <FormField control={addForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>{t.fullName}</FormLabel><FormControl><Input placeholder="مثال: نورة عبدالله" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={addForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>{t.email}</FormLabel><FormControl><Input type="email" placeholder="name@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={addForm.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>{t.password}</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={addForm.control} name="subject" render={({ field }) => (
                    <FormItem><FormLabel>{t.subject}</FormLabel><FormControl><Input placeholder="مثال: لغة عربية" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="ghost" onClick={closeDialog}>{t.cancel}</Button>
                    <Button type="submit" disabled={isProcessing}>
                      {isProcessing && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                      {t.addTeacher}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          )}
          {dialog.type === 'edit' && (
            <>
              <DialogHeader>
                <DialogTitle>{t.editTeacher}</DialogTitle>
                <DialogDescription>{t.editTeacherDesc}: {dialog.teacher?.name}</DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 pt-2">
                  <FormField control={editForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>{t.fullName}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={editForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>{t.email}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={editForm.control} name="subject" render={({ field }) => (
                    <FormItem><FormLabel>{t.subject}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="ghost" onClick={closeDialog}>{t.cancel}</Button>
                    <Button type="submit" disabled={isProcessing}>
                      {isProcessing && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                      {t.save}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          )}
          {dialog.type === 'delete' && (
            <>
              <DialogHeader>
                <DialogTitle>{t.deleteTeacher}</DialogTitle>
                <DialogDescription>
                  {t.deleteTeacherConfirm} <strong>{dialog.teacher?.name}</strong>؟ {t.deleteTeacherWarn}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={closeDialog}>{t.cancel}</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
                  {isProcessing && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t.delete}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
