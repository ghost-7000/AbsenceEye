'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { summarizeDailyAttendance } from '@/ai/flows/summarize-daily-attendance';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function AttendanceSummary() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    if (!date) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرجاء تحديد تاريخ أولاً.',
      });
      return;
    }
    setLoading(true);
    setSummary('');
    try {
      const result = await summarizeDailyAttendance({
        date: format(date, 'yyyy-MM-dd'),
      });
      setSummary(result.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      toast({
        variant: 'destructive',
        title: 'فشل إنشاء الملخص',
        description: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary"/>
            <span>ملخص الحضور اليومي الذكي</span>
        </CardTitle>
        <CardDescription>
          اختر تاريخًا لتوليد ملخص لحالة الحضور والغياب في المدرسة باستخدام الذكاء الاصطناعي.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-right font-normal sm:w-[280px]',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="ms-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: ar }) : <span>اختر تاريخًا</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(d) => d > new Date() || d < new Date('2024-01-01')}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleGenerateSummary} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                <span>جاري الإنشاء...</span>
              </>
            ) : (
              'إنشاء الملخص'
            )}
          </Button>
        </div>
        {summary && (
          <div className="mt-4 rounded-lg border bg-secondary/50 p-4">
            <h4 className="font-semibold text-foreground">الخلاصة:</h4>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
