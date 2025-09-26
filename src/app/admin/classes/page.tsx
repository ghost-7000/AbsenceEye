import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminClassesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>إدارة الصفوف</CardTitle>
                <CardDescription>عرض وإدارة جميع الصفوف الدراسية في النظام.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>سيتم عرض تفاصيل إدارة الصفوف هنا.</p>
            </CardContent>
        </Card>
    );
}
