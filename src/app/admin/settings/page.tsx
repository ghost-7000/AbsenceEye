import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminSettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>الإعدادات</CardTitle>
                <CardDescription>إدارة إعدادات النظام والتفضيلات.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>سيتم عرض خيارات الإعدادات هنا.</p>
            </CardContent>
        </Card>
    );
}
