import ClassManagement from "@/components/dashboard/admin/class-management";
import { getClassesWithStudentCounts } from '@/app/actions/admin-actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function AdminClassesPage() {
    const initialClasses = await getClassesWithStudentCounts();
    return (
        <Card>
            <CardHeader>
                <CardTitle>إدارة الصفوف الدراسية</CardTitle>
                <CardDescription>عرض وإدارة جميع الصفوف في النظام.</CardDescription>
            </CardHeader>
            <CardContent>
               <ClassManagement initialClasses={initialClasses} />
            </CardContent>
        </Card>
    );
}
