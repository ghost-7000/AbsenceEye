import { AttendanceSummary } from "@/components/dashboard/admin/attendance-summary";
import MostAbsentStudents from "@/components/dashboard/admin/most-absent-students";

export default function AdminAttendancePage() {
    return (
        <div className="grid gap-6">
            <AttendanceSummary />
            <MostAbsentStudents />
        </div>
    );
}
