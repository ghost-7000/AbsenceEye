import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TeacherProfilePage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>الملف الشخصي</CardTitle>
                <CardDescription>عرض وتعديل معلومات ملفك الشخصي.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>سيتم عرض تفاصيل الملف الشخصي هنا.</p>
            </CardContent>
        </Card>
    );
}
