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
import { GraduationCap, LayoutDashboard, Users, School, Settings, ClipboardCheck, ClipboardList } from 'lucide-react';
import { useTranslation } from '@/components/language-provider';

export default function TeacherDashboardLayout({
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
                  <Link href="/teacher/dashboard">
                      <GraduationCap className="h-8 w-8 text-primary group-data-[collapsible=icon]:group-data-[state=collapsed]:h-6 group-data-[collapsible=icon]:group-data-[state=collapsed]:w-6 transition-all" />
                  </Link>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu className="p-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={t.dashboard}>
                      <Link href="/teacher/dashboard">
                        <LayoutDashboard />
                        <span>{t.dashboard}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={t.myClasses}>
                      <Link href="/teacher/classes">
                        <School />
                        <span>{t.myClasses}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={t.takeAttendance}>
                      <Link href="/teacher/attendance">
                        <ClipboardCheck />
                        <span>{t.takeAttendance}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={t.myRecords}>
                      <Link href="/teacher/records">
                        <ClipboardList />
                        <span>{t.myRecords}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="border-t p-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={t.settings} href="/teacher/settings">
                      <Link href="/teacher/settings">
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
