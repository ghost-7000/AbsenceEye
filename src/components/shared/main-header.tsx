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
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-primary/10 bg-background/60 backdrop-blur-xl px-4 sm:px-6 shadow-sm transition-all">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="flex md:hidden" />
                 <Link href={dashboardUrl} className="flex items-center gap-2 font-semibold">
                    <div className="bg-gradient-to-br from-primary to-blue-600 p-1.5 rounded-lg shadow-md shadow-primary/20">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-headline text-xl tracking-tight hidden sm:inline-block bg-gradient-to-l from-primary to-blue-600 bg-clip-text text-transparent drop-shadow-sm">AbsenceEye</span>
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
