'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { summarizeDailyAttendance } from '@/ai/flows/summarize-daily-attendance';
import { format } from 'date-fns';
import { useTranslation } from '@/components/language-provider';

export default function DailySummary() {
    const [summary, setSummary] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const t = useTranslation();

    const handleGenerateSummary = async () => {
        setLoading(true);
        setError('');
        setSummary('');
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const result = await summarizeDailyAttendance({ date: today });
            setSummary(result.summary);
        } catch (e) {
            console.error(e);
            setError(t.errorGen);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="flex h-full flex-col">
            <CardHeader>
                <CardTitle>{t.dailySummary}</CardTitle>
                <CardDescription>
                    {t.getSummaryDetails}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center">
                {loading ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <p className="text-sm text-muted-foreground">{t.generating}</p>
                    </div>
                ) : summary ? (
                    <div className="text-sm text-right bg-secondary/50 p-4 rounded-md w-full h-full overflow-y-auto" dir="auto">
                        <p className="whitespace-pre-wrap">{summary}</p>
                    </div>
                ) : (
                     <div className="text-center">
                        <Button onClick={handleGenerateSummary}>
                            <Sparkles className="mx-2 h-4 w-4" />
                            {t.generateForToday}
                        </Button>
                         {error && <p className="text-sm text-destructive mt-4">{error}</p>}
                    </div>
                )}
            </CardContent>
            {summary && (
                 <div className="border-t p-4">
                    <Button variant="ghost" size="sm" className="w-full" onClick={handleGenerateSummary}>
                       <Sparkles className="mx-2 h-4 w-4" />
                        {t.regenerate}
                    </Button>
                 </div>
            )}
        </Card>
    );
}
