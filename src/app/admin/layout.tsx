import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { MainHeader } from '@/components/shared/main-header';
import Link from 'next/link';
import { GraduationCap, LayoutDashboard, Users, BookOpen, School, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                <Link href="/admin/dashboard">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </Link>
              </Button>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <h2 className="font-headline text-lg font-semibold">AbsenceEye</h2>
                <p className="text-xs text-muted-foreground">لوحة تحكم المديرة</p>
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
        <SidebarInset className="flex-1">
          <MainHeader title="لوحة تحكم المديرة" />
          <main className="p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
