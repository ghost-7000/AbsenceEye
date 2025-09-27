import { UserModel, TeacherModel, ClassModel, StudentModel, AttendanceRecordModel } from './models';
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

    const teacherExists = await TeacherModel.findOne({ email: 'teacher@example.com' });
     if (!teacherExists) {
      console.log('Teacher user not found, creating one...');
      await TeacherModel.create({
        name: 'المعلمة نورة',
        email: 'teacher@example.com',
        password: 'password123', // In a real app, this should be hashed
        role: 'teacher',
        subject: 'لغة عربية',
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
        // Even if students exist, check if attendance records are there to prevent re-seeding issues.
        const attendanceCount = await AttendanceRecordModel.countDocuments();
        if (attendanceCount > 0) {
            console.log('Database appears to be seeded already with students and attendance.');
            return;
        }
    }
    
    console.log('Database is empty or partially seeded, seeding with initial data...');

    // Clear collections to ensure a clean slate, except for users/teachers
    await ClassModel.deleteMany({});
    await StudentModel.deleteMany({});
    await AttendanceRecordModel.deleteMany({});
    console.log('Cleared existing class, student, and attendance data.');

    const teacher = await TeacherModel.findOne({ email: 'teacher@example.com' });
    if (!teacher) {
        console.error("Default teacher not found after seeding users. Aborting student/class seeding.");
        return;
    }

    console.log('Creating initial classes...');
    const classA = await ClassModel.create({
        name: 'الصف الأول - أ',
        teacherId: teacher._id.toString(),
        subject: 'لغة عربية',
        note: 'ملاحظات أولية حول الصف الأول - أ.'
    });
    const classB = await ClassModel.create({
        name: 'الصف الأول - ب',
        teacherId: teacher._id.toString(),
        subject: 'لغة عربية',
        note: 'ملاحظات أولية حول الصف الأول - ب.'
    });
    console.log('Classes created.');

    console.log('Creating initial students...');
    const studentsData = [
        // Class A
        { name: 'فاطمة علي', classId: classA._id.toString(), avatarUrl: '' },
        { name: 'عائشة محمد', classId: classA._id.toString(), avatarUrl: '' },
        { name: 'زينب عبدالله', classId: classA._id.toString(), avatarUrl: '' },
        { name: 'مريم أحمد', classId: classA._id.toString(), avatarUrl: '' },
        { name: 'سارة حسن', classId: classA._id.toString(), avatarUrl: '' },
        // Class B
        { name: 'هند خالد', classId: classB._id.toString(), avatarUrl: '' },
        { name: 'نورة فهد', classId: classB._id.toString(), avatarUrl: '' },
        { name: 'لولوة سعد', classId: classB._id.toString(), avatarUrl: '' },
        { name: 'جمانة ياسر', classId: classB._id.toString(), avatarUrl: '' },
        { name: 'حصة إبراهيم', classId: classB._id.toString(), avatarUrl: '' },
    ];
    const createdStudents = await StudentModel.insertMany(studentsData);
    console.log(`${createdStudents.length} students created.`);
    
    console.log('Creating initial attendance records for the past 5 days...');
    const attendanceRecords = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) { // For the last 5 days
        const day = subDays(today, i);
        const date = format(day, 'yyyy-MM-dd');
        for (const student of createdStudents) {
            // Make absences random but not too frequent
            const status = Math.random() > 0.15 ? 'present' : 'absent';
            attendanceRecords.push({
                studentId: student._id.toString(),
                classId: student.classId,
                date: date,
                status: status,
                timestamp: day, // Use the day itself for timestamp
            });
        }
    }
    
    await AttendanceRecordModel.insertMany(attendanceRecords);

    console.log('Attendance records created.');
    console.log('Database seeding complete.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
