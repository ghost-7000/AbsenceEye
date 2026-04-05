'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { MainHeader } from '@/components/shared/main-header';
import Link from 'next/link';
import { GraduationCap, LayoutDashboard, Users, School, Settings, ClipboardList } from 'lucide-react';
import { useTranslation } from '@/components/language-provider';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <Sidebar side="right" className="rtl:border-l ltr:border-r">
            <SidebarHeader className="border-b p-4 flex items-center justify-center">
                <Link href="/admin/dashboard">
                    <GraduationCap className="h-8 w-8 text-primary group-data-[collapsible=icon]:group-data-[state=collapsed]:h-6 group-data-[collapsible=icon]:group-data-[state=collapsed]:w-6 transition-all" />
                </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu className="p-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={t.dashboard}>
                    <Link href="/admin/dashboard">
                      <LayoutDashboard />
                      <span>{t.dashboard}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={t.teachers}>
                    <Link href="/admin/teachers">
                      <Users />
                      <span>{t.teachers}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={t.classes}>
                    <Link href="/admin/classes">
                      <School />
                      <span>{t.classes}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={t.attendanceRecords}>
                    <Link href="/admin/attendance-records">
                      <ClipboardList />
                      <span>{t.attendanceRecords}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={t.settings} href="/admin/settings">
                    <Link href="/admin/settings">
                      <Settings />
                      <span>{t.settings}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <div className="flex flex-1 flex-col">
            <MainHeader />
            <main className="flex-1 p-4 sm:p-6 bg-secondary/50">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
