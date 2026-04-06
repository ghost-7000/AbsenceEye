'use client';

import * as React from 'react';

type Language = 'ar' | 'en';

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLang?: Language;
};

type LanguageProviderState = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const initialState: LanguageProviderState = {
  lang: 'ar',
  setLang: () => null,
};

const LanguageProviderContext = React.createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLang = 'ar',
}: LanguageProviderProps) {
  const [lang, setLang] = React.useState<Language>(defaultLang);

  React.useEffect(() => {
    const savedLang = localStorage.getItem('appLang') as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('appLang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <LanguageProviderContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = React.useContext(LanguageProviderContext);
  if (context === undefined)
    throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const dict = {
  ar: {
    // Shared
    dashboard: 'لوحة التحكم',
    teachers: 'المعلمات',
    classes: 'الصفوف',
    attendanceRecords: 'سجلات الحضور',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    role: 'الدور',
    myClasses: 'صفوفي',
    takeAttendance: 'تسجيل الحضور',
    myRecords: 'سجلاتي',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    search: 'بحث...',
    status: 'الحالة',
    date: 'التاريخ',
    name: 'الاسم',
    actions: 'الإجراءات',
    present: 'حاضر',
    absent: 'غائب',
    noData: 'لا توجد بيانات.',
    loading: 'جاري التحميل...',
    close: 'إغلاق',
    confirm: 'تأكيد',
    add: 'إضافة',
    notSpecified: 'غير محدد',
    notAssigned: 'غير معين',
    student: 'طالب',
    students: 'الطلاب',
    class: 'الصف',
    subject: 'المادة',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    teacher: 'معلمة',
    searchByNameEmailSubject: 'بحث بالاسم، البريد، أو المادة...',
    searchByNameOrClass: 'بحث باسم الطالب أو الصف...',
    chooseDate: 'اختر تاريخًا لتصفيته',
    clearDate: 'مسح التاريخ',
    viewAllRecords: 'عرض كل السجلات',

    // Dashboard
    totalStudents: 'إجمالي الطلاب',
    totalTeachers: 'إجمالي المعلمات',
    totalClasses: 'إجمالي الصفوف',
    presentToday: 'الحضور اليوم',
    absentToday: 'الغياب اليوم',
    attendanceRate: 'نسبة الحضور',
    dailySummary: 'ملخص الحضور اليومي (AI)',
    getSummaryDetails: 'احصل على ملخص ذكي لحالة الحضور والغياب لجميع الصفوف اليوم.',
    generating: 'جاري تحليل البيانات وإنشاء الملخص...',
    generateForToday: 'إنشاء ملخص لليوم',
    regenerate: 'إعادة إنشاء الملخص',
    errorGen: 'حدث خطأ أثناء إنشاء الملخص. الرجاء المحاولة مرة أخرى.',
    mostAbsent: 'الطلاب الأكثر غياباً',
    mostAbsentDesc: 'قائمة بالطلاب الخمسة الأكثر غيابًا هذا العام.',
    recentAttendance: 'أحدث سجلات الحضور',
    noAbsenceData: 'لا توجد بيانات غياب',
    noAbsenceDataDesc: 'لم يتم تسجيل أي حالات غياب حتى الآن.',
    absenceDays: 'أيام الغياب',
    mainDashboard: 'لوحة التحكم الرئيسية',
    totalTeachersDesc: 'عدد المعلمات المسجلات في النظام',
    totalClassesDesc: 'عدد الصفوف الدراسية في النظام',
    totalStudentsDesc: 'عدد الطلاب المسجلين في جميع الصفوف',
    goToTeachers: 'الانتقال إلى صفحة المعلمات',
    goToClasses: 'الانتقال إلى صفحة الصفوف',
    manageTeachersDesc: 'عرض وتعديل وحذف بيانات المعلمات، وإضافة معلمات جدد إلى النظام.',
    manageClassesDesc: 'عرض الصفوف الدراسية، وتعيين المعلمات، وإدارة الطلاب في كل صف.',
    manageTeachers: 'إدارة المعلمات',
    manageClasses: 'إدارة الصفوف',

    // Teacher Management
    addTeacher: 'إضافة معلمة',
    addNewTeacher: 'إضافة معلمة جديدة',
    addNewTeacherDesc: 'أدخل بيانات المعلمة الجديدة. سيتم إنشاء حساب لها لتسجيل الدخول.',
    teacherName: 'اسم المعلمة',
    editTeacher: 'تعديل بيانات المعلمة',
    editTeacherDesc: 'تعديل بيانات المعلمة',
    deleteTeacher: 'تأكيد الحذف',
    deleteTeacherConfirm: 'هل أنت متأكد من رغبتك في حذف حساب المعلمة',
    deleteTeacherWarn: 'لا يمكن التراجع عن هذا الإجراء.',
    teacherAdded: 'تمت الإضافة بنجاح',
    teacherAddedDesc: 'تمت إضافة المعلمة بنجاح.',
    teacherUpdated: 'تم التعديل بنجاح',
    teacherUpdatedDesc: 'تم تعديل بيانات المعلمة بنجاح.',
    teacherDeleted: 'تم الحذف بنجاح',
    teacherDeletedDesc: 'تم حذف المعلمة بنجاح.',
    addTeacherFail: 'فشل الإضافة',
    editTeacherFail: 'فشل التعديل',
    deleteTeacherFail: 'فشل الحذف',
    addTeacherFailDesc: 'حدث خطأ أثناء إضافة المعلمة.',
    editTeacherFailDesc: 'حدث خطأ أثناء تعديل البيانات.',
    deleteTeacherFailDesc: 'حدث خطأ أثناء حذف المعلمة.',
    noTeachersFound: 'لم يتم العثور على معلمات',
    noTeachersSearch: 'جرّب كلمة بحث أخرى.',
    noTeachersStart: 'ابدأ بإضافة معلمة جديدة.',
    teacherClasses: 'صفوف المعلمة',
    teacherClassesDesc: 'جميع الصفوف الدراسية الموكلة لهذه المعلمة',
    noClassesForTeacher: 'لا توجد صفوف مسندة',
    noClassesForTeacherDesc: 'لم يتم إسناد أي صفوف لهذه المعلمة بعد.',
    classStudents: 'طلاب الصف',
    studentsCount: 'عدد الطلاب',
    clickToViewStudents: 'انقر لعرض الطلاب',
    backToClasses: 'العودة للصفوف',

    // Class / Student Management
    addClass: 'إضافة صف',
    className: 'اسم الصف',
    manageStudents: 'إدارة الطلاب',
    addStudent: 'إضافة طالب',
    responsibleTeacher: 'المعلمة المسؤولة',
    noClasses: 'لا توجد صفوف دراسية',
    noClassesDesc: 'لم يتم إنشاء أي صفوف دراسية في النظام بعد.',
    className2: 'اسم الصف',
    subjectCol: 'المادة',

    // Attendance records
    noRecordsFound: 'لم يتم العثور على سجلات',
    noRecordsTryFilter: 'جرّب تعديل فلاتر البحث.',
    noRecordsYet: 'لا توجد سجلات حضور مسجلة بعد.',

    // Login
    welcomeBack: 'مرحباً بعودتك!',
    loginSubtext: 'أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول إلى حسابك.',
    loginError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    loginSuccess: 'تم تسجيل الدخول بنجاح.',
    signingIn: 'جاري تسجيل الدخول...',
    loginBtn: 'تسجيل الدخول',

    // Settings
    settingsTitle: 'الإعدادات',
    settingsDesc: 'إدارة إعدادات النظام والتفضيلات.',
    appTheme: 'مظهر التطبيق',
    light: 'فاتح',
    dark: 'داكن',
    system: 'النظام',

    // Profile
    profileInfo: 'المعلومات الشخصية',
    profileInfoDesc: 'بياناتك الشخصية المسجلة في النظام.',
    adminRole: 'مدير',
    teacherRole: 'معلمة',

    // Teacher dashboard
    myStats: 'إحصائياتي',
    myClassesCount: 'الصفوف',
    myStudentsCount: 'الطلاب',
    myAttendanceRate: 'نسبة الحضور اليوم',
  },
  en: {
    // Shared
    dashboard: 'Dashboard',
    teachers: 'Teachers',
    classes: 'Classes',
    attendanceRecords: 'Attendance Records',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    role: 'Role',
    myClasses: 'My Classes',
    takeAttendance: 'Take Attendance',
    myRecords: 'My Records',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search...',
    status: 'Status',
    date: 'Date',
    name: 'Name',
    actions: 'Actions',
    present: 'Present',
    absent: 'Absent',
    noData: 'No data available.',
    loading: 'Loading...',
    close: 'Close',
    confirm: 'Confirm',
    add: 'Add',
    notSpecified: 'N/A',
    notAssigned: 'Unassigned',
    student: 'Student',
    students: 'Students',
    class: 'Class',
    subject: 'Subject',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    teacher: 'Teacher',
    searchByNameEmailSubject: 'Search by name, email, or subject...',
    searchByNameOrClass: 'Search by student name or class...',
    chooseDate: 'Filter by date',
    clearDate: 'Clear date',
    viewAllRecords: 'View all records',

    // Dashboard
    totalStudents: 'Total Students',
    totalTeachers: 'Total Teachers',
    totalClasses: 'Total Classes',
    presentToday: 'Present Today',
    absentToday: 'Absent Today',
    attendanceRate: 'Attendance Rate',
    dailySummary: 'Daily Attendance Summary (AI)',
    getSummaryDetails: 'Get a smart summary for the daily attendance of all classes today.',
    generating: 'Analyzing data and generating summary...',
    generateForToday: 'Generate Summary for Today',
    regenerate: 'Regenerate Summary',
    errorGen: 'An error occurred. Please try again.',
    mostAbsent: 'Most Absent Students',
    mostAbsentDesc: 'Top 5 most absent students this year.',
    recentAttendance: 'Recent Attendance Records',
    noAbsenceData: 'No Absence Data',
    noAbsenceDataDesc: 'No absences have been recorded yet.',
    absenceDays: 'Absent Days',
    mainDashboard: 'Main Dashboard',
    totalTeachersDesc: 'Number of teachers registered in the system',
    totalClassesDesc: 'Number of classes in the system',
    totalStudentsDesc: 'Number of students enrolled in all classes',
    goToTeachers: 'Go to Teachers Page',
    goToClasses: 'Go to Classes Page',
    manageTeachersDesc: 'View, edit, and delete teacher accounts, and add new teachers to the system.',
    manageClassesDesc: 'View classes, assign teachers, and manage students in each class.',
    manageTeachers: 'Manage Teachers',
    manageClasses: 'Manage Classes',

    // Teacher Management
    addTeacher: 'Add Teacher',
    addNewTeacher: 'Add New Teacher',
    addNewTeacherDesc: 'Enter the new teacher\'s details. An account will be created for them to log in.',
    teacherName: 'Teacher Name',
    editTeacher: 'Edit Teacher',
    editTeacherDesc: 'Edit teacher information for',
    deleteTeacher: 'Confirm Deletion',
    deleteTeacherConfirm: 'Are you sure you want to delete the account for',
    deleteTeacherWarn: 'This action cannot be undone.',
    teacherAdded: 'Added Successfully',
    teacherAddedDesc: 'Teacher has been added successfully.',
    teacherUpdated: 'Updated Successfully',
    teacherUpdatedDesc: 'Teacher information has been updated.',
    teacherDeleted: 'Deleted Successfully',
    teacherDeletedDesc: 'Teacher has been deleted.',
    addTeacherFail: 'Failed to Add',
    editTeacherFail: 'Failed to Edit',
    deleteTeacherFail: 'Failed to Delete',
    addTeacherFailDesc: 'An error occurred while adding the teacher.',
    editTeacherFailDesc: 'An error occurred while updating the data.',
    deleteTeacherFailDesc: 'An error occurred while deleting the teacher.',
    noTeachersFound: 'No Teachers Found',
    noTeachersSearch: 'Try a different search term.',
    noTeachersStart: 'Start by adding a new teacher.',
    teacherClasses: 'Teacher\'s Classes',
    teacherClassesDesc: 'All classes assigned to this teacher',
    noClassesForTeacher: 'No Classes Assigned',
    noClassesForTeacherDesc: 'No classes have been assigned to this teacher yet.',
    classStudents: 'Class Students',
    studentsCount: 'Students Count',
    clickToViewStudents: 'Click to view students',
    backToClasses: 'Back to classes',

    // Class / Student Management
    addClass: 'Add Class',
    className: 'Class Name',
    manageStudents: 'Manage Students',
    addStudent: 'Add Student',
    responsibleTeacher: 'Responsible Teacher',
    noClasses: 'No Classes',
    noClassesDesc: 'No classes have been created in the system yet.',
    className2: 'Class Name',
    subjectCol: 'Subject',

    // Attendance records
    noRecordsFound: 'No Records Found',
    noRecordsTryFilter: 'Try adjusting your search filters.',
    noRecordsYet: 'No attendance records have been recorded yet.',

    // Login
    welcomeBack: 'Welcome Back!',
    loginSubtext: 'Enter your email and password to log in to your account.',
    loginError: 'Incorrect email or password.',
    loginSuccess: 'Logged in successfully.',
    signingIn: 'Signing in...',
    loginBtn: 'Sign In',

    // Settings
    settingsTitle: 'Settings',
    settingsDesc: 'Manage system settings and preferences.',
    appTheme: 'App Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',

    // Profile
    profileInfo: 'Personal Information',
    profileInfoDesc: 'Your personal information registered in the system.',
    adminRole: 'Administrator',
    teacherRole: 'Teacher',

    // Teacher dashboard
    myStats: 'My Stats',
    myClassesCount: 'Classes',
    myStudentsCount: 'Students',
    myAttendanceRate: 'Today\'s Attendance Rate',
  }
};

export const useTranslation = () => {
    const { lang } = useLanguage();
    return dict[lang];
};
