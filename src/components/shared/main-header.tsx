'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './theme-toggle';
import { UserNav } from './user-nav';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export function MainHeader() {
    const [dashboardUrl, setDashboardUrl] = React.useState('/');
    const { lang, setLang } = useLanguage();

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
                {/* Language Toggle Removed as requested */}
                <ThemeToggle />
                <UserNav />
                <SidebarTrigger className="hidden md:flex" />
            </div>
        </header>
    )
}
