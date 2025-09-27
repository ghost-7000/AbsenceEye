'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle, Loader2, Search, Users } from 'lucide-react';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from '@/app/actions/admin-actions';
import { useDebounce } from '@/hooks/use-debounce';

export default function TeacherManagement({ initialTeachers }: { initialTeachers: User[]}) {
  const { toast } = useToast();
  const [teachers, setTeachers] = React.useState<User[]>(initialTeachers);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const [isAddDialogOpen, setAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedTeacher, setSelectedTeacher] = React.useState<User | null>(null);

  const fetchTeachers = React.useCallback(async () => {
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث قائمة المعلمات.'});
    }
  }, [toast]);

  const filteredTeachers = React.useMemo(() => 
    teachers.filter(
        teacher =>
        teacher.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ), [teachers, debouncedSearchTerm]);


  const handleAddTeacher = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    
    if (!name || !email) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء ملء جميع الحقول.' });
        setIsProcessing(false);
        return;
    }

    try {
      await addTeacher(name, email);
      toast({ title: 'نجاح', description: `تمت إضافة المعلمة ${name} بنجاح.` });
      await fetchTeachers(); 
      setAddDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل الإضافة', description: 'حدث خطأ أثناء إضافة المعلمة.'});
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditTeacher = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTeacher) return;
    setIsProcessing(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    try {
      await updateTeacher(selectedTeacher.id, name, email);
      toast({ title: 'نجاح', description: `تم تعديل بيانات المعلمة ${name} بنجاح.` });
      await fetchTeachers();
      setEditDialogOpen(false);
      setSelectedTeacher(null);
    } catch (error) {
       toast({ variant: 'destructive', title: 'فشل التعديل', description: 'حدث خطأ أثناء تعديل البيانات.'});
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    setIsProcessing(true);
    try {
      await deleteTeacher(selectedTeacher.id);
      toast({ title: 'نجاح', description: `تم حذف المعلمة ${selectedTeacher.name} بنجاح.` });
      await fetchTeachers();
      setDeleteDialogOpen(false);
      setSelectedTeacher(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل الحذف', description: 'حدث خطأ أثناء حذف المعلمة.'});
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="بحث بالاسم أو البريد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="gap-1 w-full sm:w-auto">
                        <PlusCircle className="h-4 w-4" />
                        <span>إضافة معلمة جديدة</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إضافة معلمة جديدة</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddTeacher}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">الاسم</Label>
                                <Input id="name" name="name" className="col-span-3" required />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">البريد</Label>
                                <Input id="email" name="email" type="email" className="col-span-3" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isProcessing}>
                              {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin"/>}
                              إضافة
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
      <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
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
                          <AvatarImage src={teacher.avatarUrl || undefined} alt={teacher.name} />
                          <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {teacher.name}
                      </div>
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
                            <DropdownMenuItem onSelect={() => { setSelectedTeacher(teacher); setEditDialogOpen(true); }}>تعديل</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => { setSelectedTeacher(teacher); setDeleteDialogOpen(true); }}>
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
                  <TableCell colSpan={3} className="h-48 text-center">
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>تعديل بيانات المعلمة</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditTeacher}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name-edit" className="text-right">الاسم</Label>
                            <Input id="name-edit" name="name" defaultValue={selectedTeacher?.name} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email-edit" className="text-right">البريد</Label>
                            <Input id="email-edit" name="email" type="email" defaultValue={selectedTeacher?.email} className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin"/>}
                          حفظ التعديلات
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>تأكيد الحذف</DialogTitle>
                    <DialogDescription>
                        هل أنت متأكد من رغبتك في حذف حساب المعلمة {selectedTeacher?.name}؟ لا يمكن التراجع عن هذا الإجراء.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
                    <Button variant="destructive" onClick={handleDeleteTeacher} disabled={isProcessing}>
                       {isProcessing && <Loader2 className="ms-2 h-4 w-4 animate-spin"/>}
                       حذف
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
