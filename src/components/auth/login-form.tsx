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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authenticate } from '@/app/actions/auth-actions';
import { Label } from '@/components/ui/label';

import { useTranslation } from '@/components/language-provider';

const createFormSchema = (t: any) => z.object({
  email: z.string().email({ message: t.email ? t.email + ' invalid' : 'بريد غير صالح' }),
  password: z.string().min(6, { message: t.password ? 'Minimum 6 chars' : 'كلمة المرور قصيرة' }),
  role: z.enum(['admin', 'teacher'], {
    required_error: t.dashboard ? 'role required' : 'الرجاء اختيار الدور.',
  }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const t = useTranslation();

  const form = useForm<z.infer<ReturnType<typeof createFormSchema>>>({
    resolver: zodResolver(createFormSchema(t)),
    defaultValues: {
      email: '',
      password: '',
      role: 'teacher',
    },
  });

  async function onSubmit(values: z.infer<ReturnType<typeof createFormSchema>>) {
    setIsLoading(true);
    
    try {
        const result = await authenticate(values);

        if (result.success && result.user) {
            const { user } = result;
            toast({
                title: t.loginSuccess,
                description: `${t.welcomeBack} ${user.name_en && localStorage.getItem('appLang') === 'en' ? user.name_en : user.name}`,
            });
            
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userNameEn', user.name_en || '');
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userAvatar', user.avatarUrl || '');

            router.replace(user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
        } else {
            toast({
                variant: 'destructive',
                title: t.loginError,
                description: result.message || t.loginError,
            });
            setIsLoading(false);
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: t.errorGen,
            description: t.errorGen,
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
                <FormItem>
                  <FormLabel>{t.role || 'Role / الدور'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.search || "Select role"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="teacher">{t.teachers || 'Teacher'}</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.email}</FormLabel>
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
                  <FormLabel>{t.password}</FormLabel>
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
              {isLoading && <Loader2 className="mx-2 h-4 w-4 animate-spin" />}
              {isLoading ? t.signingIn : t.loginBtn}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
