'use server'

import { supabaseAdmin } from '@/lib/supabase';
import type { Student, Teacher, Class } from '@/lib/types';
import { revalidatePath } from 'next/cache';

interface AbsentStudent extends Student {
  absences: number;
  className: string;
}

export async function getMostAbsentStudents(): Promise<AbsentStudent[]> {
  const { data: absentRecords } = await supabaseAdmin
    .from('attendance_records').select('student_id').eq('status', 'absent');
  if (!absentRecords || absentRecords.length === 0) return [];

  const countMap = new Map<string, number>();
  for (const r of absentRecords) {
    countMap.set(r.student_id, (countMap.get(r.student_id) || 0) + 1);
  }
  const sorted = [...countMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const studentIds = sorted.map(([id]) => id);

  const { data: students } = await supabaseAdmin.from('students').select('*').in('id', studentIds);
  if (!students || students.length === 0) return [];

  const classIds = [...new Set(students.map(s => s.class_id))];
  const { data: classes } = await supabaseAdmin.from('classes').select('id, name').in('id', classIds);
  const classMap = new Map((classes || []).map(c => [c.id, c.name]));

  return studentIds.map(studentId => {
    const s = students.find(x => x.id === studentId);
    if (!s) return null;
    return {
      id: s.id, name: s.name, classId: s.class_id, avatarUrl: s.avatar_url || '',
      absences: countMap.get(studentId) || 0,
      className: classMap.get(s.class_id) || 'غير معروف',
    };
  }).filter((s): s is AbsentStudent => s !== null);
}

export async function getTeachers(): Promise<Teacher[]> {
  const { data } = await supabaseAdmin.from('teachers').select('*');
  return (data || []).map(t => ({
    id: t.id, name: t.name, email: t.email, role: 'teacher' as const,
    subject: t.subject || 'غير محدد', avatarUrl: t.avatar_url || '',
  }));
}

export async function addTeacher(data: { name: string; email: string; password: string; subject: string }) {
  await supabaseAdmin.from('teachers').insert({ ...data, role: 'teacher', avatar_url: '' });
  revalidatePath('/admin/teachers');
  revalidatePath('/admin/dashboard');
}

export async function updateTeacher(teacherId: string, data: { name: string; email: string; subject: string }) {
  await supabaseAdmin.from('teachers').update(data).eq('id', teacherId);
  revalidatePath('/admin/teachers');
}

export async function deleteTeacher(teacherId: string) {
  await supabaseAdmin.from('teachers').delete().eq('id', teacherId);
  revalidatePath('/admin/teachers');
  revalidatePath('/admin/dashboard');
}

export async function getAdminStats() {
  const [{ count: totalTeachers }, { count: totalClasses }, { count: totalStudents }] = await Promise.all([
    supabaseAdmin.from('teachers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('classes').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('students').select('*', { count: 'exact', head: true }),
  ]);
  return { totalTeachers: totalTeachers || 0, totalClasses: totalClasses || 0, totalStudents: totalStudents || 0 };
}

export interface DetailedAttendanceRecord {
  id: string; studentId: string; classId: string; date: string;
  status: 'present' | 'absent'; timestamp: string;
  studentName: string; className: string; subject?: string;
}

export async function getDetailedAttendanceRecords(): Promise<DetailedAttendanceRecord[]> {
  const { data: records } = await supabaseAdmin
    .from('attendance_records').select('*')
    .order('date', { ascending: false }).order('timestamp', { ascending: false }).limit(200);
  if (!records || records.length === 0) return [];

  const studentIds = [...new Set(records.map(r => r.student_id))];
  const classIds = [...new Set(records.map(r => r.class_id))];
  const [{ data: students }, { data: classes }] = await Promise.all([
    supabaseAdmin.from('students').select('id, name').in('id', studentIds),
    supabaseAdmin.from('classes').select('id, name, subject').in('id', classIds),
  ]);
  const studentMap = new Map((students || []).map(s => [s.id, s.name]));
  const classMap = new Map((classes || []).map(c => [c.id, { name: c.name, subject: c.subject }]));

  return records.map(r => {
    const studentName = studentMap.get(r.student_id);
    const classInfo = classMap.get(r.class_id);
    if (!studentName || !classInfo) return null;
    return {
      id: r.id, studentId: r.student_id, classId: r.class_id, date: r.date,
      status: r.status as 'present' | 'absent',
      timestamp: r.timestamp || new Date(r.date).toISOString(),
      studentName, className: classInfo.name, subject: classInfo.subject,
    };
  }).filter((r): r is DetailedAttendanceRecord => r !== null);
}

export interface ClassWithStudentCount extends Omit<Class, 'teacherId'> {
  id: string; teacherId: string; studentCount: number; teacherName: string;
}

export async function getClassesWithStudentCounts(): Promise<ClassWithStudentCount[]> {
  const { data: classes } = await supabaseAdmin.from('classes').select('*');
  if (!classes || classes.length === 0) return [];

  const teacherIds = [...new Set(classes.map(c => c.teacher_id).filter(Boolean))];
  const { data: teachers } = await supabaseAdmin.from('teachers').select('id, name').in('id', teacherIds);
  const teacherMap = new Map((teachers || []).map(t => [t.id, t.name]));

  const result: ClassWithStudentCount[] = [];
  for (const cls of classes) {
    const { count } = await supabaseAdmin
      .from('students').select('*', { count: 'exact', head: true }).eq('class_id', cls.id);
    result.push({
      id: cls.id, name: cls.name, teacherId: cls.teacher_id || '',
      subject: cls.subject, note: cls.note,
      studentCount: count || 0,
      teacherName: teacherMap.get(cls.teacher_id) || 'غير معين',
    });
  }
  return result;
}