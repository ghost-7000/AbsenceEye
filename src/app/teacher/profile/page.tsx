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

const profileSchema = z.object({
  name: z.string().min(2, { message: 'الاسم يجب أن يتكون من حرفين على الأقل.' }),
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صالح.' }),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين.',
  path: ['confirmPassword'],
});

export default function TeacherProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [user, setUser] = React.useState({ name: '', email: '', avatar: '' });
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    const name = localStorage.getItem('userName') || 'المعلمة سارة';
    const email = localStorage.getItem('userEmail') || 'teacher1@school.com';
    const avatar = localStorage.getItem('userAvatar') || '';
    setUser({ name, email, avatar });
    form.reset({ name, email });
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

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    setIsLoading(true);
    console.log(values);

    setTimeout(() => {
      localStorage.setItem('userName', values.name);
      localStorage.setItem('userEmail', values.email);
      if (avatarPreview) {
        localStorage.setItem('userAvatar', avatarPreview);
      }
      
      toast({
        title: 'تم تحديث الملف الشخصي',
        description: 'تم حفظ معلوماتك الجديدة بنجاح.',
      });
      setIsLoading(false);
      // Force a re-render of components that use localStorage
      window.dispatchEvent(new Event("storage"));
    }, 1000);
  };

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
                  <AvatarImage src={avatarPreview || user.avatar} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
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
               <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="اتركها فارغة لعدم التغيير" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="أعد إدخال كلمة المرور" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                حفظ التغييرات
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
