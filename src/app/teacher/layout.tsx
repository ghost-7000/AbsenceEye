'use client';

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { MainHeader } from '@/components/shared/main-header';
import Link from 'next/link';
import { GraduationCap, LayoutDashboard, School, Settings, ClipboardCheck, ClipboardList, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/components/language-provider';

export default function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar side="right" collapsible="icon" className="group rtl:border-l ltr:border-r border-primary/10 shadow-lg shadow-black/5 z-50 relative">
            <SidebarTrigger className="absolute top-1/2 -translate-y-1/2 -left-3.5 z-50 hidden md:flex h-7 w-7 items-center justify-center rounded-full border border-primary/20 bg-background shadow-md hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[collapsible=icon]:group-data-[state=collapsed]:rotate-180" />
            </SidebarTrigger>
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
                  <SidebarMenu className="space-y-1.5">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={t.dashboard} className="hover:bg-primary/10 hover:text-primary transition-colors rounded-lg py-2.5 px-3 font-medium group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <Link href="/teacher/dashboard">
                          <LayoutDashboard className="h-5 w-5 opacity-80" />
                          <span className="text-[15px] group-data-[collapsible=icon]:hidden">{t.dashboard}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3 group-data-[collapsible=icon]:hidden">أدوات المعلم</p>
                <div>
                  <SidebarMenu className="space-y-1.5">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={t.myClasses} className="hover:bg-primary/10 hover:text-primary transition-colors rounded-lg py-2.5 px-3 font-medium group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <Link href="/teacher/classes">
                          <School className="h-5 w-5 opacity-80" />
                          <span className="text-[15px] group-data-[collapsible=icon]:hidden">{t.myClasses}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={t.takeAttendance} className="hover:bg-primary/10 hover:text-primary transition-colors rounded-lg py-2.5 px-3 font-medium group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <Link href="/teacher/attendance">
                          <ClipboardCheck className="h-5 w-5 opacity-80" />
                          <span className="text-[15px] group-data-[collapsible=icon]:hidden">{t.takeAttendance}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={t.myRecords} className="hover:bg-primary/10 hover:text-primary transition-colors rounded-lg py-2px-3 font-medium group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <Link href="/teacher/records">
                          <ClipboardList className="h-5 w-5 opacity-80" />
                          <span className="text-[15px] group-data-[collapsible=icon]:hidden">{t.myRecords}</span>
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
                  <SidebarMenuButton asChild tooltip={t.settings} className="hover:bg-primary/10 hover:text-primary py-2 transition-colors rounded-lg group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                    <Link href="/teacher/settings">
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
