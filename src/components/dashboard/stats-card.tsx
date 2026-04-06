'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

interface StatsCardProps {
  title: string;
  titleEn?: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  descriptionEn?: string;
  trend?: string;
}

export function StatsCard({ title, titleEn, value, icon: Icon, description, descriptionEn }: StatsCardProps) {
  const { lang } = useLanguage();
  const displayTitle = lang === 'en' && titleEn ? titleEn : title;
  const displayDesc = lang === 'en' && descriptionEn ? descriptionEn : description;

  return (
    <Card className="hover:shadow-md transition-all hover:scale-[1.01]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{displayTitle}</CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{value}</div>
        {displayDesc && <p className="text-xs text-muted-foreground mt-1">{displayDesc}</p>}
      </CardContent>
    </Card>
  );
}
