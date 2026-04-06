'use server'

import { supabaseAdmin } from '@/lib/supabase';
import type { Class, Student, Teacher } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import type { DetailedAttendanceRecord as AdminDetailedAttendanceRecord } from './admin-actions';

export type DetailedAttendanceRecord = AdminDetailedAttendanceRecord;

export type ClassWithStudents = {
  id: string; name: string; name_en?: string; teacherId: string; subject?: string; note?: string;
  students: { id: string; name: string; name_en?: string; classId: string; avatarUrl: string; }[];
};

export async function getTeacherData(teacherId: string): Promise<Teacher> {
  const { data } = await supabaseAdmin.from('teachers').select('*').eq('id', teacherId).single();
  if (!data) throw new Error('Teacher not found');
  return { id: data.id, name: data.name, email: data.email, role: 'teacher', subject: data.subject, avatarUrl: data.avatar_url || '' };
}

export async function getTeacherClassesAndStudents(teacherId: string): Promise<ClassWithStudents[]> {
  const { data: classes } = await supabaseAdmin.from('classes').select('*').eq('teacher_id', teacherId);
  if (!classes || classes.length === 0) return [];

  const result: ClassWithStudents[] = [];
  for (const cls of classes) {
    const { data: students } = await supabaseAdmin
      .from('students').select('*').eq('class_id', cls.id).order('name');
    result.push({
      id: cls.id, name: cls.name, name_en: cls.name_en, teacherId: cls.teacher_id,
      subject: cls.subject, note: cls.note,
      students: (students || []).map(s => ({ id: s.id, name: s.name, name_en: s.name_en, avatarUrl: s.avatar_url || '', classId: s.class_id })),
    });
  }
  return result;
}

export async function addClass(name: string, subject: string, teacherId: string) {
  await supabaseAdmin.from('classes').insert({ name, subject, teacher_id: teacherId });
  revalidatePath('/teacher/classes');
}

export async function addStudent(name: string, classId: string) {
  await supabaseAdmin.from('students').insert({ name, class_id: classId, avatar_url: '' });
  revalidatePath('/teacher/classes');
}

export async function deleteStudent(studentId: string) {
  await supabaseAdmin.from('attendance_records').delete().eq('student_id', studentId);
  await supabaseAdmin.from('students').delete().eq('id', studentId);
  revalidatePath('/teacher/classes');
}

export async function updateClassName(classId: string, name: string) {
  await supabaseAdmin.from('classes').update({ name }).eq('id', classId);
  revalidatePath('/teacher/classes');
}

export async function updateClassNote(classId: string, note: string) {
  await supabaseAdmin.from('classes').update({ note }).eq('id', classId);
  revalidatePath('/teacher/classes');
}

export async function deleteClass(classId: string) {
  await supabaseAdmin.from('attendance_records').delete().eq('class_id', classId);
  await supabaseAdmin.from('students').delete().eq('class_id', classId);
  await supabaseAdmin.from('classes').delete().eq('id', classId);
  revalidatePath('/teacher/classes');
  revalidatePath('/teacher/dashboard');
}

export async function updateStudentName(studentId: string, name: string) {
  await supabaseAdmin.from('students').update({ name }).eq('id', studentId);
  revalidatePath('/teacher/classes');
}

type AttendanceData = { studentId: string; classId: string; status: 'present' | 'absent'; };

export async function saveAttendance(records: AttendanceData[]) {
  const date = format(new Date(), 'yyyy-MM-dd');
  const timestamp = new Date().toISOString();
  const upsertData = records.map(r => ({
    student_id: r.studentId, class_id: r.classId, date, status: r.status, timestamp,
  }));
  await supabaseAdmin.from('attendance_records').upsert(upsertData, { onConflict: 'student_id,class_id,date' });
  revalidatePath('/teacher/attendance');
  revalidatePath('/teacher/dashboard');
  revalidatePath('/teacher/records');
  revalidatePath('/admin/attendance-records');
  revalidatePath('/admin/dashboard');
}

export async function getAttendanceForDate(teacherId: string, date: string) {
  const { data: teacherClasses } = await supabaseAdmin.from('classes').select('id').eq('teacher_id', teacherId);
  const classIds = (teacherClasses || []).map(c => c.id);
  if (classIds.length === 0) return [];

  const { data } = await supabaseAdmin
    .from('attendance_records').select('*').in('class_id', classIds).eq('date', date);
  return (data || []).map(r => ({
    id: r.id, studentId: r.student_id, classId: r.class_id, date: r.date,
    status: r.status as 'present' | 'absent',
    timestamp: r.timestamp || new Date(r.date).toISOString(),
  }));
}

export async function getTeacherStats(teacherId: string) {
  const { data: teacherClasses } = await supabaseAdmin.from('classes').select('id').eq('teacher_id', teacherId);
  const classIds = (teacherClasses || []).map(c => c.id);
  const classCount = classIds.length;

  if (classIds.length === 0) return { classCount: 0, studentCount: 0, attendancePercentage: 0 };

  const { count: studentCount } = await supabaseAdmin
    .from('students').select('*', { count: 'exact', head: true }).in('class_id', classIds);

  let attendancePercentage = 0;
  if (studentCount && studentCount > 0) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const [{ count: presentCount }, { count: totalTaken }] = await Promise.all([
      supabaseAdmin.from('attendance_records').select('*', { count: 'exact', head: true }).in('class_id', classIds).eq('date', today).eq('status', 'present'),
      supabaseAdmin.from('attendance_records').select('*', { count: 'exact', head: true }).in('class_id', classIds).eq('date', today),
    ]);
    if (totalTaken && totalTaken > 0) attendancePercentage = Math.round(((presentCount || 0) / totalTaken) * 100);
  }
  return { classCount, studentCount: studentCount || 0, attendancePercentage };
}

export async function getDetailedAttendanceForTeacher(teacherId: string): Promise<DetailedAttendanceRecord[]> {
  const { data: teacherClasses } = await supabaseAdmin.from('classes').select('*').eq('teacher_id', teacherId);
  if (!teacherClasses || teacherClasses.length === 0) return [];

  const classIds = teacherClasses.map(c => c.id);
  const { data: records } = await supabaseAdmin
    .from('attendance_records').select('*').in('class_id', classIds)
    .order('date', { ascending: false }).order('timestamp', { ascending: false });
  if (!records || records.length === 0) return [];

  const studentIds = [...new Set(records.map(r => r.student_id))];
  const { data: students } = await supabaseAdmin.from('students').select('id, name').in('id', studentIds);
  const studentMap = new Map((students || []).map(s => [s.id, s.name]));
  const classMap = new Map(teacherClasses.map(c => [c.id, { name: c.name, subject: c.subject }]));

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