'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './theme-toggle';
import { UserNav } from './user-nav';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function MainHeader() {
    const [dashboardUrl, setDashboardUrl] = React.useState('/');

    React.useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
            setDashboardUrl(`/${userRole}/dashboard`);
        } else {
            setDashboardUrl('/login');
        }
    }, []);

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="flex md:hidden" />
                 <Link href={dashboardUrl} className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="font-headline text-lg tracking-tight hidden sm:inline-block">AbsenceEye</span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <UserNav />
                <SidebarTrigger className="hidden md:flex" />
            </div>
        </header>
    )
}
