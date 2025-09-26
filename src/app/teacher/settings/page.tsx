import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TeacherSettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>الإعدادات</CardTitle>
                <CardDescription>إدارة إعدادات حسابك وتفضيلاتك.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>سيتم عرض خيارات الإعدادات هنا.</p>
            </CardContent>
        </Card>
    );
}
