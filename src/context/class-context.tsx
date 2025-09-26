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

  const value = {
    teacherClasses,
    allStudents,
    teacherStudents,
    getStudentsByClass,
    addClass,
    addStudent
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