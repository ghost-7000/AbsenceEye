'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authenticate } from '@/app/actions/auth-actions';

const formSchema = z.object({
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صالح.' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن لا تقل عن 6 أحرف.' }),
  role: z.enum(['admin', 'teacher'], {
    required_error: 'الرجاء اختيار الدور.',
  }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'teacher',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
        const result = await authenticate(values);

        if (result.success && result.user) {
            const { user } = result;
            toast({
                title: 'تم تسجيل الدخول بنجاح',
                description: `مرحباً بك ${user.name}.`,
            });
            
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userAvatar', user.avatarUrl || '');

            router.replace(user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
        } else {
            toast({
                variant: 'destructive',
                title: 'خطأ في تسجيل الدخول',
                description: result.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
            });
            setIsLoading(false);
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'خطأ غير متوقع',
            description: 'حدث خطأ أثناء محاولة تسجيل الدخول. الرجاء المحاولة مرة أخرى.',
        });
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>الدور</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="teacher" id="teacher" />
                        <Label htmlFor="teacher" className="font-normal cursor-pointer">
                          معلمة
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin" className="font-normal cursor-pointer">
                          مديرة
                        </Label>
                      </div>
                    </RadioGroup>
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
                    <Input placeholder="name@example.com" {...field} />
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
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              تسجيل الدخول
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
