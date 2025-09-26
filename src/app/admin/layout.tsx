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
import { GraduationCap, LayoutDashboard, Users, School, Settings, BarChart3, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
       <div className="flex min-h-screen flex-col">
        <MainHeader title="لوحة تحكم المديرة" />
        <div className="flex flex-1">
          <Sidebar side="right" collapsible="icon">
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-sidebar-primary" asChild>
                  <Link href="/admin/dashboard">
                    <GraduationCap className="h-6 w-6" />
                  </Link>
                </Button>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <h2 className="font-headline text-lg font-semibold text-sidebar-foreground">AbsenceEye</h2>
                  <p className="text-xs text-sidebar-foreground/80">لوحة تحكم المديرة</p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="لوحة التحكم">
                    <Link href="/admin/dashboard">
                      <LayoutDashboard />
                      <span>لوحة التحكم</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="إدارة المعلمات">
                    <Link href="/admin/teachers">
                      <Users />
                      <span>المعلمات</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="إدارة الصفوف">
                    <Link href="/admin/classes">
                      <School />
                      <span>الصفوف</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="ملخص الحضور">
                    <Link href="/admin/attendance">
                      <BarChart3 />
                      <span>ملخص الحضور</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="الإعدادات">
                    <Link href="/admin/settings">
                      <Settings />
                      <span>الإعدادات</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1 p-4 sm:p-6 bg-background">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
