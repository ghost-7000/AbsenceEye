import AttendanceRecordsTable from "@/components/dashboard/admin/attendance-records-table";
import { getDetailedAttendanceRecords } from '@/app/actions/admin-actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function AttendanceRecordsPage() {
    const initialRecords = await getDetailedAttendanceRecords();
    return (
        <Card>
            <CardHeader>
                <CardTitle>سجلات الحضور والغياب</CardTitle>
                <CardDescription>
                    عرض وتصفية جميع سجلات حضور وغياب الطلاب في المدرسة.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AttendanceRecordsTable initialRecords={initialRecords} />
            </CardContent>
        </Card>
    );
}
