import { supabaseAdmin } from './supabase';
import { format, subDays } from 'date-fns';

declare global {
  var __absenceeye_seeded: boolean;
}

export async function seedDatabase() {
  if (global.__absenceeye_seeded) return;

  try {
    // Ensure admin exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('users').select('id').eq('email', 'admin@example.com').maybeSingle();

    if (!existingAdmin) {
      await supabaseAdmin.from('users').insert({
        name: 'المديرة',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        avatar_url: 'https://picsum.photos/seed/admin/200/200',
      });
    }

    // Ensure teacher exists
    const { data: existingTeacher } = await supabaseAdmin
      .from('teachers').select('id').eq('email', 'teacher@example.com').maybeSingle();

    if (!existingTeacher) {
      await supabaseAdmin.from('teachers').insert({
        name: 'المعلمة نورة',
        email: 'teacher@example.com',
        password: 'password123',
        role: 'teacher',
        subject: 'لغة عربية',
        avatar_url: 'https://picsum.photos/seed/teacher1/200/200',
      });
    }

    // Check if already seeded
    const { count: studentCount } = await supabaseAdmin
      .from('students').select('*', { count: 'exact', head: true });
    const { count: attendanceCount } = await supabaseAdmin
      .from('attendance_records').select('*', { count: 'exact', head: true });

    if (studentCount && studentCount > 0 && attendanceCount && attendanceCount > 0) {
      global.__absenceeye_seeded = true;
      return;
    }

    const { data: teacher } = await supabaseAdmin
      .from('teachers').select('id').eq('email', 'teacher@example.com').single();
    if (!teacher) return;

    // Create classes
    const { data: classes } = await supabaseAdmin.from('classes').insert([
      { name: 'الصف الأول - أ', teacher_id: teacher.id, subject: 'لغة عربية', note: 'ملاحظات أولية حول الصف الأول - أ.' },
      { name: 'الصف الأول - ب', teacher_id: teacher.id, subject: 'لغة عربية', note: 'ملاحظات أولية حول الصف الأول - ب.' },
    ]).select();

    if (!classes || classes.length < 2) return;
    const [classA, classB] = classes;

    // Create students
    const { data: students } = await supabaseAdmin.from('students').insert([
      { name: 'فاطمة علي', class_id: classA.id, avatar_url: '' },
      { name: 'عائشة محمد', class_id: classA.id, avatar_url: '' },
      { name: 'زينب عبدالله', class_id: classA.id, avatar_url: '' },
      { name: 'مريم أحمد', class_id: classA.id, avatar_url: '' },
      { name: 'سارة حسن', class_id: classA.id, avatar_url: '' },
      { name: 'هند خالد', class_id: classB.id, avatar_url: '' },
      { name: 'نورة فهد', class_id: classB.id, avatar_url: '' },
      { name: 'لولوة سعد', class_id: classB.id, avatar_url: '' },
      { name: 'جمانة ياسر', class_id: classB.id, avatar_url: '' },
      { name: 'حصة إبراهيم', class_id: classB.id, avatar_url: '' },
    ]).select();

    if (!students) return;

    const today = new Date();
    const records = [];
    for (let i = 0; i < 5; i++) {
      const day = subDays(today, i);
      const date = format(day, 'yyyy-MM-dd');
      for (const student of students) {
        records.push({
          student_id: student.id,
          class_id: student.class_id,
          date,
          status: Math.random() > 0.15 ? 'present' : 'absent',
          timestamp: day.toISOString(),
        });
      }
    }
    await supabaseAdmin.from('attendance_records').insert(records);
    global.__absenceeye_seeded = true;
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Seed error:', error);
  }
}