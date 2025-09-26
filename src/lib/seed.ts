import { UserModel, ClassModel, StudentModel, AttendanceRecordModel } from './models';
import { format, subDays } from 'date-fns';

async function ensureAdminAndTeacherExist() {
    const adminExists = await UserModel.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Admin user not found, creating one...');
      await UserModel.create({
        name: 'المديرة',
        email: 'admin@example.com',
        password: 'password123', // In a real app, this should be hashed
        role: 'admin',
        avatarUrl: 'https://picsum.photos/seed/admin/200/200',
      });
      console.log('Admin user created.');
    }

    const teacherExists = await UserModel.findOne({ email: 'teacher@example.com' });
     if (!teacherExists) {
      console.log('Teacher user not found, creating one...');
      await UserModel.create({
        name: 'المعلمة نورة',
        email: 'teacher@example.com',
        password: 'password123', // In a real app, this should be hashed
        role: 'teacher',
        avatarUrl: 'https://picsum.photos/seed/teacher1/200/200',
      });
       console.log('Teacher user created.');
    }
}


// This function will be called once when the database connection is established.
export async function seedDatabase() {
  try {
    
    // Always ensure default users exist, this is cheap.
    await ensureAdminAndTeacherExist();

    const studentCount = await StudentModel.countDocuments();
    if (studentCount > 0) {
        console.log('Database appears to be seeded already with students.');
        return;
    }
    
    console.log('Database is empty, seeding with initial data...');

    const teacher = await UserModel.findOne({ email: 'teacher@example.com' });
    if (!teacher) {
        console.error("Default teacher not found after seeding users. Aborting student/class seeding.");
        return;
    }

    console.log('Creating initial classes...');
    const classA = await ClassModel.create({
        name: 'الصف الأول - أ',
        teacherId: teacher._id.toString(),
        note: 'ملاحظات أولية حول الصف الأول - أ.'
    });
    const classB = await ClassModel.create({
        name: 'الصف الأول - ب',
        teacherId: teacher._id.toString(),
        note: 'ملاحظات أولية حول الصف الأول - ب.'
    });
    console.log('Classes created.');

    console.log('Creating initial students...');
    const studentsData = [
        // Class A
        { name: 'فاطمة علي', classId: classA._id.toString(), avatarUrl: 'https://picsum.photos/seed/s1/200' },
        { name: 'عائشة محمد', classId: classA._id.toString(), avatarUrl: 'https://picsum.photos/seed/s2/200' },
        { name: 'زينب عبدالله', classId: classA._id.toString(), avatarUrl: 'https://picsum.photos/seed/s3/200' },
        { name: 'مريم أحمد', classId: classA._id.toString(), avatarUrl: 'https://picsum.photos/seed/s4/200' },
        { name: 'سارة حسن', classId: classA._id.toString(), avatarUrl: 'https://picsum.photos/seed/s5/200' },
        // Class B
        { name: 'هند خالد', classId: classB._id.toString(), avatarUrl: 'https://picsum.photos/seed/s6/200' },
        { name: 'نورة فهد', classId: classB._id.toString(), avatarUrl: 'https://picsum.photos/seed/s7/200' },
        { name: 'لولوة سعد', classId: classB._id.toString(), avatarUrl: 'https://picsum.photos/seed/s8/200' },
        { name: 'جمانة ياسر', classId: classB._id.toString(), avatarUrl: 'https://picsum.photos/seed/s9/200' },
        { name: 'حصة إبراهيم', classId: classB._id.toString(), avatarUrl: 'https://picsum.photos/seed/s10/200' },
    ];
    const createdStudents = await StudentModel.insertMany(studentsData);
    console.log(`${createdStudents.length} students created.`);
    
    console.log('Creating initial attendance records for the past 5 days...');
    const attendanceRecords = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) { // For the last 5 days
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        for (const student of createdStudents) {
            // Make absences random but not too frequent
            const status = Math.random() > 0.15 ? 'present' : 'absent';
            attendanceRecords.push({
                studentId: student._id.toString(),
                classId: student.classId.toString(),
                date: date,
                status: status
            });
        }
    }
    
    // Use bulk insert with ordered: false to avoid stopping on duplicate key errors if re-run
    await AttendanceRecordModel.insertMany(attendanceRecords, { ordered: false }).catch(err => {
        // Ignore duplicate key errors, which can happen if seeding is interrupted and re-run
        if (err.code !== 11000) {
            console.error('Error inserting attendance records:', err);
        }
    });

    console.log('Attendance records created.');
    console.log('Database seeding complete.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
