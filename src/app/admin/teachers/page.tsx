import TeacherManagement from "@/components/dashboard/admin/teacher-management";
import { getTeachers } from '@/app/actions/admin-actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Teacher } from "@/lib/types";

export default async function AdminTeachersPage() {
    const initialTeachers: Teacher[] = await getTeachers();
    return (
        <Card>
            <CardHeader>
                <CardTitle>إدارة المعلمات</CardTitle>
                <CardDescription>
                إضافة وتعديل وحذف حسابات المعلمات في النظام.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TeacherManagement initialTeachers={initialTeachers} />
            </CardContent>
        </Card>
    );
}
