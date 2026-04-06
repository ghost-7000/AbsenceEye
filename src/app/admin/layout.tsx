'use client';

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { MainHeader } from '@/components/shared/main-header';
import Link from 'next/link';
import { GraduationCap, LayoutDashboard, Users, School, Settings, ClipboardList } from 'lucide-react';
import { useTranslation } from '@/components/language-provider';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar side="right" collapsible="icon" className="rtl:border-l ltr:border-r border-primary/10 shadow-lg shadow-black/5 z-50">
            <SidebarHeader className="border-b border-primary/5 p-6 flex flex-col items-center justify-center gap-3">
                <div className="bg-gradient-to-br from-primary to-blue-600 p-2.5 rounded-xl shadow-lg shadow-primary/20 group-data-[collapsible=icon]:p-1.5 focus:scale-95 transition-all">
                    <GraduationCap className="h-8 w-8 text-white transition-all transform group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                </div>
                <span className="font-headline text-xl tracking-tight bg-gradient-to-l from-primary to-blue-600 bg-clip-text text-transparent font-bold group-data-[collapsible=icon]:hidden">AbsenceEye</span>
            </SidebarHeader>
            
            <SidebarContent className="px-3 py-6 hidden-scrollbar">
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3 group-data-[collapsible=icon]:hidden">الرئيسية</p>
                <div>
                  <SidebarMenu className="space-y-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={t.dashboard} className="hover:bg-primary/10 hover:text-primary transition-colors rounded-lg py-5 px-4 font-medium group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <Link href="/admin/dashboard">
                          <LayoutDashboard className="h-5 w-5 opacity-80" />
                          <span className="text-[15px] group-data-[collapsible=icon]:hidden">{t.dashboard}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3 group-data-[collapsible=icon]:hidden">الإدارة الأكاديمية</p>
                <div>
                  <SidebarMenu className="space-y-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={t.teachers} className="hover:bg-primary/10 hover:text-primary transition-colors rounded-lg py-5 px-4 font-medium group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <Link href="/admin/teachers">
                          <Users className="h-5 w-5 opacity-80" />
                          <span className="text-[15px] group-data-[collapsible=icon]:hidden">{t.teachers}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={t.classes} className="hover:bg-primary/10 hover:text-primary transition-colors rounded-lg py-5 px-4 font-medium group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <Link href="/admin/classes">
                          <School className="h-5 w-5 opacity-80" />
                          <span className="text-[15px] group-data-[collapsible=icon]:hidden">{t.classes}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={t.attendanceRecords} className="hover:bg-primary/10 hover:text-primary transition-colors rounded-lg py-5 px-4 font-medium group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <Link href="/admin/attendance-records">
                          <ClipboardList className="h-5 w-5 opacity-80" />
                          <span className="text-[15px] group-data-[collapsible=icon]:hidden">{t.attendanceRecords}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
              </div>
            </SidebarContent>
            
            <SidebarFooter className="border-t border-primary/10 p-4 bg-muted/30">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={t.settings} className="hover:bg-primary/10 hover:text-primary transition-colors rounded-lg group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                    <Link href="/admin/settings">
                      <Settings className="h-5 w-5 opacity-80" />
                      <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{t.settings}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          
          <div className="flex flex-1 flex-col w-full min-w-0">
            <MainHeader />
            <main className="flex-1 p-4 sm:p-8 md:p-10 bg-secondary/30 overflow-y-auto">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
