'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

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
import { users as initialUsers } from '@/lib/data';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function TeacherManagement() {
  const { toast } = useToast();
  const [teachers, setTeachers] = React.useState<User[]>(
    initialUsers.filter(u => u.role === 'teacher')
  );
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddDialogOpen, setAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedTeacher, setSelectedTeacher] = React.useState<User | null>(null);

  const filteredTeachers = teachers.filter(
    teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeacher = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    
    // Basic validation
    if (!name || !email) {
        toast({
            variant: 'destructive',
            title: 'خطأ',
            description: 'الرجاء ملء جميع الحقول.',
        });
        return;
    }

    const newTeacher: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'teacher',
        avatarUrl: ``, // No avatar
    };

    setTeachers(prev => [...prev, newTeacher]);
    toast({
        title: 'نجاح',
        description: `تمت إضافة المعلمة ${name} بنجاح.`,
    });
    setAddDialogOpen(false);
    form.reset();
  };

  const handleEditTeacher = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTeacher) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    setTeachers(prev => prev.map(t => t.id === selectedTeacher.id ? {...t, name, email} : t));
    toast({
        title: 'نجاح',
        description: `تم تعديل بيانات المعلمة ${name} بنجاح.`,
    });
    setEditDialogOpen(false);
    setSelectedTeacher(null);
  };

  const handleDeleteTeacher = () => {
    if (!selectedTeacher) return;
    setTeachers(prev => prev.filter(t => t.id !== selectedTeacher.id));
     toast({
        title: 'نجاح',
        description: `تم حذف المعلمة ${selectedTeacher.name} بنجاح.`,
    });
    setDeleteDialogOpen(false);
    setSelectedTeacher(null);
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
                            <Button type="submit">إضافة</Button>
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
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={undefined} alt={teacher.name} />
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
                        <Button type="submit">حفظ التعديلات</Button>
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
                    <Button variant="destructive" onClick={handleDeleteTeacher}>حذف</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </Card>
  );
}
