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

    // Dashboard
    totalStudents: 'إجمالي الطلاب',
    totalStudentsDesc: 'عدد الطلاب المسجلين في جميع الصفوف',
    totalTeachers: 'إجمالي المعلمات',
    totalTeachersDesc: 'عدد المعلمات المسجلات في النظام',
    totalClasses: 'إجمالي الصفوف',
    totalClassesDesc: 'عدد الصفوف الدراسية في النظام',
    manageTeachers: 'إدارة المعلمات',
    manageTeachersDesc: 'عرض وتعديل وحذف بيانات المعلمات، وإضافة معلمات جدد إلى النظام.',
    manageClasses: 'إدارة الصفوف',
    manageClassesDesc: 'عرض الصفوف الدراسية، وتعيين المعلمات، وإدارة الطلاب في كل صف.',
    goToTeachers: 'الانتقال إلى صفحة المعلمات',
    goToClasses: 'الانتقال إلى صفحة الصفوف',
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
    recentAttendance: 'أحدث سجلات الحضور',
    noData: 'لا توجد بيانات.',

    // Teacher Management
    addTeacher: 'إضافة معلمة',
    teacherName: 'اسم المعلمة',
    subject: 'المادة',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    editTeacher: 'تعديل المعلمة',
    deleteTeacherConfirm: 'هل أنت متأكد من حذف هذه المعلمة؟',
    
    // Class / Student Management
    addClass: 'إضافة صف',
    className: 'اسم الصف',
    studentsCount: 'عدد الطلاب',
    manageStudents: 'إدارة الطلاب',
    addStudent: 'إضافة طالب',

    // Login
    welcomeBack: 'مرحباً بعودتك!',
    loginSubtext: 'أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول إلى حسابك.',
    loginError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    loginSuccess: 'تم تسجيل الدخول بنجاح.',
    signingIn: 'جاري تسجيل الدخول...',
    loginBtn: 'تسجيل الدخول',
    
    // Hierarchy
    schoolHierarchy: 'الهيكل المدرسي',
    schoolHierarchyDesc: 'استعراض شامل للمعلمات، الصفوف، والطلاب.',
    teacherClasses: 'صفوف المعلمة',
    classStudents: 'طلاب الصف',
    noClasses: 'لا توجد صفوف',
    noStudents: 'لا يوجد طلاب',
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

    // Dashboard
    totalStudents: 'Total Students',
    totalStudentsDesc: 'Number of enrolled students in all classes',
    totalTeachers: 'Total Teachers',
    totalTeachersDesc: 'Number of registered teachers in the system',
    totalClasses: 'Total Classes',
    totalClassesDesc: 'Number of classes in the system',
    manageTeachers: 'Manage Teachers',
    manageTeachersDesc: 'View, edit, and delete teachers, or add new teachers to the system.',
    manageClasses: 'Manage Classes',
    manageClassesDesc: 'View classes, assign teachers, and manage students in each class.',
    goToTeachers: 'Go to Teachers Page',
    goToClasses: 'Go to Classes Page',
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
    recentAttendance: 'Recent Attendance Records',
    noData: 'No data available.',

    // Teacher Management
    addTeacher: 'Add Teacher',
    teacherName: 'Teacher Name',
    subject: 'Subject',
    email: 'Email',
    password: 'Password',
    editTeacher: 'Edit Teacher',
    deleteTeacherConfirm: 'Are you sure you want to delete this teacher?',

    // Class / Student Management
    addClass: 'Add Class',
    className: 'Class Name',
    studentsCount: 'Students Count',
    manageStudents: 'Manage Students',
    addStudent: 'Add Student',

    // Login
    welcomeBack: 'Welcome Back!',
    loginSubtext: 'Enter your email and password to log in to your account.',
    loginError: 'Incorrect email or password.',
    loginSuccess: 'Logged in successfully.',
    signingIn: 'Signing in...',
    loginBtn: 'Sign In',

    // Hierarchy
    schoolHierarchy: 'School Hierarchy',
    schoolHierarchyDesc: 'Comprehensive view of teachers, classes, and students.',
    teacherClasses: 'Teacher\'s Classes',
    classStudents: 'Class Students',
    noClasses: 'No classes',
    noStudents: 'No students',
  }
};

export const useTranslation = () => {
    const { lang } = useLanguage();
    return dict[lang];
};

export function LocalizedText({ tKey }: { tKey: keyof typeof dict['ar'] }) {
    const t = useTranslation();
    return <>{t[tKey]}</>;
}

export const getLocalizedName = (item: { name: string; name_en?: string }, lang: 'ar' | 'en') => {
  if (!item) return '';
  return lang === 'en' && item.name_en ? item.name_en : item.name;
};
