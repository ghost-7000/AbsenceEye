'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { classes as initialClasses, students as initialStudents } from '@/lib/data';
import type { Class, Student } from '@/lib/types';

interface ClassContextType {
  teacherClasses: Class[];
  allStudents: Student[];
  teacherStudents: Student[];
  getStudentsByClass: (classId: string) => Student[];
  addClass: (name: string) => void;
  addStudent: (name: string, classId: string) => void;
  deleteStudent: (studentId: string, classId: string) => void;
  updateClassNote: (classId: string, note: string) => void;
  updateClassName: (classId: string, name: string) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export function ClassProvider({ children }: { children: ReactNode }) {
  const teacherId = '2'; // Mock teacher ID
  const [allClasses, setAllClasses] = useState<Class[]>(initialClasses);
  const [allStudents, setAllStudents] = useState<Student[]>(initialStudents);
  
  const teacherClasses = allClasses.filter(c => c.teacherId === teacherId);
  const teacherStudents = allStudents.filter(s => teacherClasses.some(tc => tc.id === s.classId));

  const getStudentsByClass = (classId: string) => {
    return allStudents.filter(s => s.classId === classId);
  };
  
  const addClass = (name: string) => {
    const newClass: Class = {
      id: `c${Date.now()}`,
      name,
      teacherId: teacherId,
      note: '',
    };
    setAllClasses(prev => [...prev, newClass]);
  };

  const addStudent = (name: string, classId: string) => {
    const newStudent: Student = {
      id: `s${Date.now()}`,
      name,
      classId: classId,
      avatarUrl: '',
    };
    setAllStudents(prev => [...prev, newStudent]);
  };

  const deleteStudent = (studentId: string, classId: string) => {
    // This is a simple implementation. In a real app, you might want to confirm the classId matches.
    setAllStudents(prev => prev.filter(s => s.id !== studentId));
  };
  
  const updateClassName = (classId: string, name: string) => {
    setAllClasses(prev => prev.map(c => c.id === classId ? { ...c, name } : c));
  }

  const updateClassNote = (classId: string, note: string) => {
    setAllClasses(prev => prev.map(c => c.id === classId ? { ...c, note } : c));
  }

  const value = {
    teacherClasses,
    allStudents,
    teacherStudents,
    getStudentsByClass,
    addClass,
    addStudent,
    deleteStudent,
    updateClassNote,
    updateClassName
  };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClasses must be used within a ClassProvider');
  }
  return context;
}
