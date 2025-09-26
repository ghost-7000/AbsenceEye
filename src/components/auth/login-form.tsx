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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صالح.' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن لا تقل عن 6 أحرف.' }),
  role: z.enum(['admin', 'teacher'], {
    required_error: 'الرجاء اختيار الدور.',
  }),
});

const DEMO_ACCOUNTS = {
  admin: { email: 'admin@school.com', password: 'Admin123' },
  teacher: { email: 'teacher1@school.com', password: 'Teacher123' },
};

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const { email, password, role } = values;
      const account = DEMO_ACCOUNTS[role];

      if (email === account.email && password === account.password) {
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: `مرحباً بك في لوحة تحكم ${role === 'admin' ? 'المديرة' : 'المعلمة'}.`,
        });
        
        // In a real app, you'd store a session token. Here we use localStorage for demo simplicity.
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', role === 'admin' ? 'المديرة' : 'المعلمة سارة');
        localStorage.setItem('userEmail', email);

        router.replace(role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'خطأ في تسجيل الدخول',
          description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. الرجاء المحاولة مرة أخرى.',
        });
        setIsLoading(false);
      }
    }, 1000);
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
                      <FormItem className="flex items-center space-x-2 space-x-reverse">
                        <FormControl>
                          <RadioGroupItem value="teacher" id="teacher" />
                        </FormControl>
                        <FormLabel htmlFor="teacher" className="font-normal">
                          معلمة
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-x-reverse">
                        <FormControl>
                          <RadioGroupItem value="admin" id="admin" />
                        </FormControl>
                        <FormLabel htmlFor="admin" className="font-normal">
                          مديرة
                        </FormLabel>
                      </FormItem>
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
