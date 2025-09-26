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
import { GraduationCap, LayoutDashboard, Users, School, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <Sidebar side="right">
            <SidebarHeader className="border-b p-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-12 w-12 text-primary" asChild>
                  <Link href="/admin/dashboard">
                    <GraduationCap className="h-7 w-7" />
                  </Link>
                </Button>
                <div className="flex flex-col group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden">
                  <h2 className="font-headline text-lg font-semibold">AbsenceEye</h2>
                  <p className="text-xs text-muted-foreground">لوحة تحكم المديرة</p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu className="p-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="لوحة التحكم" href="/admin/dashboard">
                    <Link href="/admin/dashboard">
                      <LayoutDashboard />
                      <span>لوحة التحكم</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="إدارة المعلمات" href="/admin/teachers">
                    <Link href="/admin/teachers">
                      <Users />
                      <span>المعلمات</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="إدارة الصفوف" href="/admin/classes">
                    <Link href="/admin/classes">
                      <School />
                      <span>الصفوف</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="ملخص الحضور" href="/admin/attendance">
                    <Link href="/admin/attendance">
                      <BarChart3 />
                      <span>ملخص الحضور</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="الإعدادات" href="/admin/settings">
                    <Link href="/admin/settings">
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
  );
}
