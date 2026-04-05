import { supabaseAdmin } from './supabase';
import { format, subDays } from 'date-fns';

declare global {
  var __absenceeye_seeded: boolean;
}

export async function seedDatabase() {
  if (global.__absenceeye_seeded) return;

  try {
    // 1. Create Admins
    const { data: existingAdmin } = await supabaseAdmin
      .from('users').select('id').eq('email', 'admin@example.com').maybeSingle();

    if (!existingAdmin) {
      await supabaseAdmin.from('users').insert({
        name: 'أمل الحوسني - مديرة النظام',
        email: 'admin@example.com',
        password: '12345678',
        role: 'admin',
        avatar_url: 'https://picsum.photos/seed/adminoman/200/200',
      });
    }

    // 2. Create Teachers List
    const teachersList = [
      { email: 'teacher@example.com', name: 'المعلمة فاطمة البلوشي', subject: 'الرياضيات' },
      { email: 'mariam.alhabsi@gmail.com', name: 'المعلمة مريم الحبسي', subject: 'اللغة العربية' },
      { email: 'zahra.albusaidi@outlook.com', name: 'المعلمة زهرة البوسعيدي', subject: 'العلوم' },
      { email: 'salma.alhashmi@gmail.com', name: 'المعلمة سلمى الهاشمي', subject: 'اللغة الإنجليزية' }
    ];

    for (let t of teachersList) {
      const { data: exist } = await supabaseAdmin.from('teachers').select('id').eq('email', t.email).maybeSingle();
      if (!exist) {
        await supabaseAdmin.from('teachers').insert({
          name: t.name,
          email: t.email,
          password: '12345678',
          role: 'teacher',
          subject: t.subject,
          avatar_url: `https://picsum.photos/seed/${t.email}/200/200`,
        });
      }
    }

    // 3. Check if we have classes/students, else seed
    const { count: studentCount } = await supabaseAdmin.from('students').select('*', { count: 'exact', head: true });
    
    // Only continue seeding students and attendance if it's completely empty
    if (studentCount !== null && studentCount > 0) {
      global.__absenceeye_seeded = true;
      return;
    }

    const { data: teachersDB } = await supabaseAdmin.from('teachers').select('id, email');
    if (!teachersDB || teachersDB.length === 0) return;

    // Map teachers to create classes
    const classesData = [];
    const classNames = ['الصف الأول - أ', 'الصف الثاني - ب', 'الصف الثالث - ج', 'الصف الرابع - د', 'الصف الخامس - أ'];
    
    for (let i = 0; i < teachersDB.length; i++) {
        // give each teacher 1 or 2 classes
        classesData.push({
            name: classNames[i % classNames.length],
            teacher_id: teachersDB[i].id,
            subject: 'تدريس عام',
            note: 'ملاحظات المعلمة'
        });
        if (i===0 || i===1) {
            classesData.push({
                name: classNames[(i+2) % classNames.length] + ' إضافي',
                teacher_id: teachersDB[i].id,
                subject: 'حصص تقوية',
                note: 'ملاحظات المعلمة'
            });
        }
    }

    const { data: insertedClasses } = await supabaseAdmin.from('classes').insert(classesData).select();
    if (!insertedClasses || insertedClasses.length === 0) return;

    // 4. Create Students (Omani Arabic Names)
    const firstNames = ['فاطمة', 'عائشة', 'مريم', 'زينب', 'شيخة', 'ميثاء', 'أسماء', 'هاجر', 'ليان', 'حور'];
    const lastNames = ['البلوشي', 'الحوسني', 'البوسعيدي', 'الحبسي', 'الهاشمي', 'العامري', 'الشامسي', 'المعولي'];

    const studentsData = [];
    for (const cls of insertedClasses) {
        // Add 8-12 students per class
        const numStudents = Math.floor(Math.random() * 5) + 8;
        for (let s = 0; s < numStudents; s++) {
            const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
            studentsData.push({
                name: `${fName} ${lName}`,
                class_id: cls.id,
                avatar_url: ''
            });
        }
    }

    const { data: insertedStudents } = await supabaseAdmin.from('students').insert(studentsData).select();
    if (!insertedStudents) return;

    // 5. Create Attendance Records for last 10 days
    const attendanceRecords = [];
    const today = new Date();
    // Week days only (skip rough simulation of weekends)
    for (let i = 0; i < 14; i++) {
      const day = subDays(today, i);
      const isWeekend = day.getDay() === 5 || day.getDay() === 6; // Fri or Sat
      if (isWeekend) continue;

      const dateStr = format(day, 'yyyy-MM-dd');
      for (const student of insertedStudents) {
        // Omani schools - usually high attendance, 10% absent rate
        const status = Math.random() > 0.08 ? 'present' : 'absent';
        attendanceRecords.push({
          student_id: student.id,
          class_id: student.class_id,
          date: dateStr,
          status: status,
          timestamp: day.toISOString(),
        });
      }
    }

    // Insert records in batches if too large, but 1000 records should be fine
    await supabaseAdmin.from('attendance_records').insert(attendanceRecords);

    global.__absenceeye_seeded = true;
    console.log('Omani Database data seeded successfully.');
  } catch (error) {
    console.error('Seed error:', error);
  }
}