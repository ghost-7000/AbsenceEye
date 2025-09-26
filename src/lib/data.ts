import type { User, Class, Student, AttendanceRecord } from '@/lib/types';

export const users: User[] = [
  {
    id: '1',
    name: 'المديرة',
    email: 'admin@school.com',
    role: 'admin',
    avatarUrl: `https://picsum.photos/seed/admin-avatar/100/100`,
  },
  {
    id: '2',
    name: 'المعلمة سارة',
    email: 'teacher1@school.com',
    role: 'teacher',
    avatarUrl: `https://picsum.photos/seed/sara-avatar/100/100`,
  },
  {
    id: '3',
    name: 'المعلمة فاطمة',
    email: 'teacher2@school.com',
    role: 'teacher',
    avatarUrl: `https://picsum.photos/seed/fatima-avatar/100/100`,
  },
];

export const classes: Class[] = [
  { id: 'c1', name: 'الصف الأول - أ', teacherId: '2' },
  { id: 'c2', name: 'الصف الأول - ب', teacherId: '2' },
  { id: 'c3', name: 'الصف الثاني - أ', teacherId: '3' },
];

export const students: Student[] = [
  { id: 's1', name: 'أحمد عبدالله', classId: 'c1', avatarUrl: `https://picsum.photos/seed/s1/100/100` },
  { id: 's2', name: 'بدر خالد', classId: 'c1', avatarUrl: `https://picsum.photos/seed/s2/100/100` },
  { id: 's3', name: 'جمانة علي', classId: 'c1', avatarUrl: `https://picsum.photos/seed/s3/100/100` },
  { id: 's4', name: 'دانة فهد', classId: 'c2', avatarUrl: `https://picsum.photos/seed/s4/100/100` },
  { id: 's5', name: 'هتان صالح', classId: 'c2', avatarUrl: `https://picsum.photos/seed/s5/100/100` },
  { id: 's6', name: 'وليد محمد', classId: 'c3', avatarUrl: `https://picsum.photos/seed/s6/100/100` },
  { id: 's7', name: 'زينب يوسف', classId: 'c3', avatarUrl: `https://picsum.photos/seed/s7/100/100` },
];

// Generate some random attendance data for the last 7 days
const today = new Date();
const attendance: AttendanceRecord[] = [];
for (let i = 0; i < 7; i++) {
  const date = new Date(today);
  date.setDate(today.getDate() - i);
  const dateString = date.toISOString().split('T')[0];

  students.forEach(student => {
    // Make some students more frequently absent
    const isFrequentlyAbsent = ['s2', 's5'].includes(student.id);
    const absenceProbability = isFrequentlyAbsent ? 0.4 : 0.1;

    attendance.push({
      id: `att-${student.id}-${dateString}`,
      studentId: student.id,
      classId: student.classId,
      date: dateString,
      status: Math.random() < absenceProbability ? 'absent' : 'present',
    });
  });
}

export const attendanceRecords: AttendanceRecord[] = attendance;
