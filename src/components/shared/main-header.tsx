'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './theme-toggle';
import { UserNav } from './user-nav';
import Link from 'next/link';
import { GraduationCap, Globe } from 'lucide-react';

export function MainHeader() {
    const [dashboardUrl, setDashboardUrl] = React.useState('/');
    const [lang, setLang] = React.useState('ar');

    React.useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
            setDashboardUrl(`/${userRole}/dashboard`);
        } else {
            setDashboardUrl('/login');
        }
    }, []);

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-card/80 backdrop-blur-md px-4 sm:px-6 shadow-sm">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="flex md:hidden" />
                 <Link href={dashboardUrl} className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-7 w-7 text-primary" />
                    <span className="font-headline text-xl tracking-tight hidden sm:inline-block bg-gradient-to-l from-primary to-blue-600 bg-clip-text text-transparent">AbsenceEye</span>
                </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                    className="group relative flex h-9 w-9 items-center justify-center rounded-md border bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                    title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
                >
                    <Globe className="h-[1.2rem] w-[1.2rem] transition-transform group-hover:rotate-12 group-hover:scale-110" />
                    <span className="sr-only">Toggle language</span>
                </button>
                <ThemeToggle />
                <UserNav />
                <SidebarTrigger className="hidden md:flex" />
            </div>
        </header>
    )
}
