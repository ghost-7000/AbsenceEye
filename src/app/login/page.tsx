import { LoginForm } from '@/components/auth/login-form';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground">
            AbsenceEye
          </h1>
          <p className="mt-2 text-muted-foreground">أهلاً بك! الرجاء تسجيل الدخول للمتابعة.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
