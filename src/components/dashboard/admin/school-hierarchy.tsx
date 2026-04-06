'use client';

import * as React from 'react';
import { useLanguage } from '@/components/language-provider';
import { getLocalizedName, useTranslation } from '@/components/language-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, School } from 'lucide-react';
import type { HierarchyTeacher } from '@/app/actions/admin-actions';
import { Badge } from '@/components/ui/badge';

interface SchoolHierarchyProps {
  data: HierarchyTeacher[];
}

export function SchoolHierarchy({ data }: SchoolHierarchyProps) {
  const { lang } = useLanguage();
  const t = useTranslation();

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <School className="h-10 w-10 text-muted-foreground/50" />
          <p>{t.noData}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-t-4 border-t-primary shadow-md transition-shadow hover:shadow-lg">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center gap-3">
          <School className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl">{t.schoolHierarchy}</CardTitle>
            <CardDescription className="mt-1">{t.schoolHierarchyDesc}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="multiple" className="w-full">
          {data.map((teacher) => (
            <AccordionItem value={`teacher-${teacher.id}`} key={teacher.id} className="border-b last:border-b-0 px-4 md:px-6">
              <AccordionTrigger className="hover:no-underline hover:bg-muted/50 rounded-lg px-2 my-1 transition-colors">
                <div className="flex items-center gap-4 text-start">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={teacher.avatarUrl} alt={getLocalizedName(teacher, lang)} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {getLocalizedName(teacher, lang).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-base">{getLocalizedName(teacher, lang)}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      <BookOpen className="h-3 w-3" />
                      <span>{teacher.subject}</span>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full mr-2">
                        {teacher.classes.length} {t.classes}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-1 px-2 md:px-14">
                <Accordion type="multiple" className="w-full pl-4 md:pl-0 border-l-2 border-primary/20 pr-4 rtl:pl-0 rtl:pr-4 rtl:border-l-0 rtl:border-r-2">
                  {teacher.classes.map((cls) => (
                    <AccordionItem value={`class-${cls.id}`} key={cls.id} className="border-none">
                      <AccordionTrigger className="py-3 hover:no-underline hover:text-primary transition-colors group">
                        <div className="flex items-center gap-3 text-start">
                          <div className="bg-secondary p-2 rounded-md group-hover:bg-primary/20 transition-colors">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-medium">{getLocalizedName(cls, lang)}</span>
                            <span className="text-xs text-muted-foreground ml-3 rtl:mr-3 inline-flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" /> {cls.students.length} {t.studentsCount}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 rtl:pr-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                          {cls.students.map((student) => (
                            <div key={student.id} className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-lg border border-transparent hover:border-border transition-all hover:bg-muted/70">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.avatarUrl} alt={getLocalizedName(student, lang)} />
                                <AvatarFallback className="text-xs">{getLocalizedName(student, lang).charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium truncate" title={getLocalizedName(student, lang)}>
                                {getLocalizedName(student, lang)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
