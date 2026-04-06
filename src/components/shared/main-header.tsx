'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { GraduationCap, Bell, Search } from 'lucide-react';
import { UserNav } from './user-nav';
import { ThemeToggle } from './theme-toggle';
import { Input } from '@/components/ui/input';

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
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-4 border-b border-primary/10 bg-background/80 backdrop-blur-xl px-4 sm:px-6 shadow-sm transition-all">
            <div className="flex items-center gap-2">
                {/* Mobile sidebar trigger */}
                <SidebarTrigger className="md:hidden" />
                
                {/* Logo visible ONLY on Mobile because PC has it in the Sidebar */}
                <Link href={dashboardUrl} className="md:hidden flex items-center justify-center gap-2 font-semibold">
                    <div className="bg-gradient-to-br from-primary to-blue-600 p-1.5 rounded-lg shadow-md shadow-primary/20">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                </Link>

                {/* Desktop Search Bar (Premium feel) */}
                <div className="hidden md:flex relative w-64 lg:w-96">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="بحث سريع..." className="pr-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50" />
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
                <button className="hidden sm:flex relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
                </button>
                <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
                <ThemeToggle />
                <UserNav />
            </div>
        </header>
    )
}
