'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export default function TeacherManagement() {
  const { toast } = useToast();
  const [teachers, setTeachers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [isAddDialogOpen, setAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedTeacher, setSelectedTeacher] = React.useState<User | null>(null);

  const fetchTeachers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل قائمة المعلمات.'});
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);


  const filteredTeachers = teachers.filter(
    teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      fetchTeachers(); // Refresh
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
      await updateTeacher(selectedTeacher._id.toString(), name, email);
      toast({ title: 'نجاح', description: `تم تعديل بيانات المعلمة ${name} بنجاح.` });
      fetchTeachers();
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
      await deleteTeacher(selectedTeacher._id.toString());
      toast({ title: 'نجاح', description: `تم حذف المعلمة ${selectedTeacher.name} بنجاح.` });
      fetchTeachers();
      setDeleteDialogOpen(false);
      setSelectedTeacher(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل الحذف', description: 'حدث خطأ أثناء حذف المعلمة.'});
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
            <div>
                <CardTitle>إدارة المعلمات</CardTitle>
                <CardDescription>
                إضافة وتعديل وحذف حسابات المعلمات.
                </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        <span>إضافة معلمة</span>
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
                                <Input id="name" name="name" className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                                <Input id="email" name="email" type="email" className="col-span-3" />
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
        <div className="mt-4">
            <Input 
                placeholder="بحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map(teacher => (
                  <TableRow key={teacher._id.toString()}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={teacher.avatarUrl || undefined} alt={teacher.name} />
                          <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {teacher.name}
                      </div>
                    </TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    لا توجد نتائج.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

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
                            <Input id="name-edit" name="name" defaultValue={selectedTeacher?.name} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email-edit" className="text-right">البريد الإلكتروني</Label>
                            <Input id="email-edit" name="email" type="email" defaultValue={selectedTeacher?.email} className="col-span-3" />
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

    </Card>
  );
}

    