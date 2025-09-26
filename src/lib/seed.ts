import { UserModel, ClassModel, StudentModel, AttendanceRecordModel } from './models';

// This function will be called once when the database connection is established.
export async function seedDatabase() {
  try {
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
    } else {
        console.log('Admin user already exists.');
    }

    const teacherExists = await UserModel.findOne({ email: 'teacher@example.com' });
    if (!teacherExists) {
      console.log('Teacher user not found, creating one...');
      await UserModel.create({
        name: 'المعلمة نورة',
        email: 'teacher@example.com',
        password: 'password123', // In a real app, this should be hashed
        role: 'teacher',
        avatarUrl: 'https://picsum.photos/seed/teacher/200/200',
      });
       console.log('Teacher user created.');
    } else {
        console.log('Teacher user already exists.');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
