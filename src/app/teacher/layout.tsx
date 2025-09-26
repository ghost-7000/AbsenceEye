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
import { LayoutDashboard, Users, BookOpen, Settings, GraduationCap } from 'lucide-react';
import { ClassProvider } from '@/context/class-context';

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClassProvider>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <div className="flex flex-1">
            <Sidebar side="right">
              <SidebarHeader className="border-b p-4 flex items-center justify-center">
                  <Link href="/teacher/dashboard">
                      <GraduationCap className="h-8 w-8 text-primary group-data-[collapsible=icon]:group-data-[state=collapsed]:h-6 group-data-[collapsible=icon]:group-data-[state=collapsed]:w-6 transition-all" />
                  </Link>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu className="p-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="لوحة التحكم" href="/teacher/dashboard">
                      <Link href="/teacher/dashboard">
                        <LayoutDashboard />
                        <span>نظرة عامة</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="صفوفي" href="/teacher/classes">
                      <Link href="/teacher/classes">
                        <BookOpen />
                        <span>صفوفي</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="تسجيل الحضور" href="/teacher/attendance">
                      <Link href="/teacher/attendance">
                        <Users />
                        <span>تسجيل الحضور</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="border-t p-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="الإعدادات" href="/teacher/settings">
                      <Link href="/teacher/settings">
                        <Settings />
                        <span>الإعدادات</span>
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
    </ClassProvider>
  );
}
