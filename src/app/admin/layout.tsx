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
            <SidebarHeader className="border-b p-4 flex items-center justify-center">
                <Link href="/admin/dashboard">
                    <GraduationCap className="h-8 w-8 text-primary group-data-[collapsible=icon]:group-data-[state=collapsed]:h-6 group-data-[collapsible=icon]:group-data-[state=collapsed]:w-6 transition-all" />
                </Link>
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
