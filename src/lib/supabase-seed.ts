import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE URL or SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const teachersData = [
  { email: 'teacher1@example.com', name: 'أ. مريم البلوشي', name_en: 'Ms. Maryam Al-Balushi', subject: 'الرياضيات' },
  { email: 'teacher2@example.com', name: 'أ. خديجة الرئيسية', name_en: 'Ms. Khadija Al-Raisi', subject: 'العلوم' },
  { email: 'teacher3@example.com', name: 'أ. فاطمة العامري', name_en: 'Ms. Fatima Al-Amri', subject: 'اللغة الإنجليزية' },
  { email: 'admin@example.com', name: 'مديرة المدرسة', name_en: 'School Principal', subject: 'الإدارة' } // Adding Admin just in case
];

// Omani generic student names
const firstNamesAr = ['ميثاء', 'شهد', 'مزن', 'الريم', 'نوف', 'عفراء', 'شيخة', 'حور', 'عهد', 'غدير', 'مروة', 'رهف', 'لجين', 'ريم', 'حليمة', 'شروق', 'طيف', 'ندى', 'جواهر', 'حنان'];
const lastNamesAr = ['البلوشي', 'الرئيسي', 'المعولي', 'الخاطري', 'الوهيبي', 'الكندي', 'الزدجالي', 'العامري', 'الحارثي', 'البوسعيدي'];

const firstNamesEn = ['Maitha', 'Shahad', 'Muzn', 'Alreem', 'Nouf', 'Afraa', 'Sheikha', 'Hoor', 'Ahad', 'Ghadeer', 'Marwa', 'Rahaf', 'Lujain', 'Reem', 'Halima', 'Shorooq', 'Taif', 'Nada', 'Jawaher', 'Hanan'];
const lastNamesEn = ['Al-Balushi', 'Al-Raisi', 'Al-Maawali', 'Al-Khatri', 'Al-Wahaibi', 'Al-Kindi', 'Al-Zadjali', 'Al-Amri', 'Al-Harthi', 'Al-Busaidi'];

function generateRandomStudent() {
  const fIndex = Math.floor(Math.random() * firstNamesAr.length);
  const lIndex = Math.floor(Math.random() * lastNamesAr.length);
  return {
    name: `${firstNamesAr[fIndex]} ${lastNamesAr[lIndex]}`,
    name_en: `${firstNamesEn[fIndex]} ${lastNamesEn[lIndex]}`,
    avatarUrl: ''
  };
}

async function runSeed() {
  console.log("🚀 Starting database seeding with Bilingual data...");

  // 1. Delete all existing data
  console.log("🧹 Wiping old data...");
  await supabaseAdmin.from('attendance_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('classes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // We do not delete teachers, we assume they are there. But let's fetch them!
  const { data: existingTeachers } = await supabaseAdmin.from('teachers').select('*');
  
  if (!existingTeachers || existingTeachers.length === 0) {
      console.log("❌ No teachers found! Please register teachers inside the platform first (From the Dashboard).");
      return;
  }
  
  console.log(`✅ Found ${existingTeachers.length} teachers. Assigning classes...`);

  // 2. Insert Classes for each teacher
  let classList: any[] = [];
  const classGradesAr = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classGradesEn = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
  
  existingTeachers.forEach((teacher, idx) => {
      // Create 3 to 4 classes per teacher
      const numClasses = 3 + (idx % 2); // alternates 3 and 4
      for(let j=1; j<=numClasses; j++) {
           const randGrade = Math.floor(Math.random() * classGradesAr.length);
           classList.push({ 
               name: `الصف ${classGradesAr[randGrade]} / ${j}`, 
               name_en: `Grade ${classGradesEn[randGrade]} / ${j}`,
               subject: teacher.subject || 'عام',
               teacher_id: teacher.id
           });
      }
  });

  console.log(`📚 Creating ${classList.length} Classes tied to Teachers...`);
  const { data: classesData, error: classErr } = await supabaseAdmin.from('classes').insert(classList).select();
  if (classErr) { console.error("Error inserting classes:", classErr); return; }

  // 3. Create 20 students per class
  console.log("👩‍🎓 Creating ~20 bilingual students per class...");
  const studentsToInsert = [];
  for (const cls of classesData!) {
      for (let i=0; i<20; i++) {
          const student = generateRandomStudent();
          studentsToInsert.push({
              name: student.name,
              name_en: student.name_en,
              class_id: cls.id,
              avatar_url: ''
          });
      }
  }
  
  const { data: stdData, error: stdErr } = await supabaseAdmin.from('students').insert(studentsToInsert).select();
  if (stdErr) { console.error("Error inserting students:", stdErr); return; }

  // 4. Generate random attendance for the past 7 days
  console.log("🗓 Generating random attendance records (15% absences)...");
  const attendanceToInsert = [];
  const today = new Date();
  
  for (let idx = 0; idx < 7; idx++) {
      const d = new Date(today);
      d.setDate(d.getDate() - idx);
      const dateStr = d.toISOString().split('T')[0];
      
      for (const std of stdData!) {
         // 85% present, 15% absent
         const isPresent = Math.random() > 0.15;
         attendanceToInsert.push({
             student_id: std.id,
             class_id: std.class_id,
             date: dateStr,
             status: isPresent ? 'present' : 'absent',
             timestamp: d.toISOString()
         });
      }
  }

  // Insert attendance in chunks to avoid payload too large limit
  for (let i = 0; i < attendanceToInsert.length; i += 500) {
      const chunk = attendanceToInsert.slice(i, i + 500);
      const { error: attErr } = await supabaseAdmin.from('attendance_records').insert(chunk);
      if (attErr) { console.error("Error inserting attendance chunk:", attErr); return; }
  }

  console.log(`✅ Database explicitly seeded!`);
  console.log(`Total Teachers Linked: ${existingTeachers.length}`);
  console.log(`Total Classes Created: ${classesData.length}`);
  console.log(`Total Students Created: ${stdData.length}`);
  console.log(`Total Attendance Records Created: ${attendanceToInsert.length}`);
}

runSeed().catch(console.error);