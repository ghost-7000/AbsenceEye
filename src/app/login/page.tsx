'use client';

import { LoginForm } from '@/components/auth/login-form';
import { GraduationCap } from 'lucide-react';
import { useTranslation } from '@/components/language-provider';

export default function LoginPage() {
  const t = useTranslation();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AbsenceEye
          </h1>
          <p className="mt-2 text-muted-foreground">{t.loginSubtext}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
