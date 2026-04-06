'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUser, updateUser, updatePassword } from '@/app/actions/auth-actions';
import type { User, Teacher } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type UnifiedUser = User | Teacher;

const profileSchema = z.object({
  name: z.string().min(2, { message: 'الاسم يجب أن يتكون من حرفين على الأقل.' }),
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صالح.' }),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين.',
  path: ['confirmPassword'],
});

export default function AdminProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);

  const [user, setUser] = React.useState<UnifiedUser | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });


  React.useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');

      if (userId && (userRole === 'admin' || userRole === 'teacher')) {
        const fetchedUser = await getUser(userId, userRole);
        if (fetchedUser) {
            setUser(fetchedUser);
            form.reset({
              name: fetchedUser.name,
              email: fetchedUser.email,
            });
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const updatedUser = await updateUser(user.id, user.role, { 
        name: values.name, 
        email: values.email, 
        avatarDataUrl: avatarPreview 
      });

      setUser(updatedUser);
      localStorage.setItem('userName', updatedUser.name);
      localStorage.setItem('userEmail', updatedUser.email);
      if (updatedUser.avatarUrl) {
          localStorage.setItem('userAvatar', updatedUser.avatarUrl);
      }
      window.dispatchEvent(new Event("storage"));
      
      toast({
        title: 'تم تحديث الملف الشخصي',
        description: 'تم حفظ معلوماتك الجديدة بنجاح.',
      });
      setAvatarPreview(null);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل تحديث الملف الشخصي.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    setIsSavingPassword(true);
    try {
      await updatePassword(user.id, user.role, values.password);
      toast({
        title: 'تم تحديث كلمة المرور',
        description: 'تم تغيير كلمة المرور بنجاح.',
      });
      passwordForm.reset();
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل تحديث كلمة المرور.',
      });
    } finally {
      setIsSavingPassword(false);
    }
  }
  
  if (loading) {
      return (
          <div className="grid gap-6">
              <Card>
                  <CardHeader>
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent className="space-y-8">
                       <div className="flex items-center gap-6">
                           <Skeleton className="h-24 w-24 rounded-full" />
                           <div className="grid gap-2">
                               <Skeleton className="h-10 w-36" />
                               <Skeleton className="h-3 w-48" />
                           </div>
                       </div>
                       <div className="space-y-2">
                           <Skeleton className="h-4 w-16" />
                           <Skeleton className="h-10 w-full" />
                       </div>
                       <div className="space-y-2">
                           <Skeleton className="h-4 w-16" />
                           <Skeleton className="h-10 w-full" />
                       </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                       <Skeleton className="h-10 w-32" />
                  </CardFooter>
              </Card>
          </div>
      )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>الملف الشخصي</CardTitle>
          <CardDescription>
            عرض وتعديل معلومات ملفك الشخصي.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || user?.avatarUrl} alt={user?.name}/>
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-2">
                   <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    تغيير الصورة
                  </Button>
                  <Input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF بحجم لا يتجاوز 10MB
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم</FormLabel>
                    <FormControl>
                      <Input placeholder="اسمك الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                حفظ التغييرات
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>تغيير كلمة المرور</CardTitle>
          </CardHeader>
          <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                  <CardContent className="space-y-4">
                      <FormField
                          control={passwordForm.control}
                          name="password"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>كلمة المرور الجديدة</FormLabel>
                                  <FormControl>
                                      <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                                  <FormControl>
                                      <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                      <Button type="submit" disabled={isSavingPassword}>
                          {isSavingPassword && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          تغيير كلمة المرور
                      </Button>
                  </CardFooter>
              </form>
          </Form>
      </Card>
    </div>
  );
}
