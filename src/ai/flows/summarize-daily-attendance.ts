'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { supabaseAdmin } from '@/lib/supabase';

const SummarizeDailyAttendanceInputSchema = z.object({
  date: z.string(),
  stats: z.string().optional(),
});

export type SummarizeDailyAttendanceInput = z.infer<typeof SummarizeDailyAttendanceInputSchema>;

const SummarizeDailyAttendanceOutputSchema = z.object({
  summary: z.string(),
});

export type SummarizeDailyAttendanceOutput = z.infer<typeof SummarizeDailyAttendanceOutputSchema>;

export async function summarizeDailyAttendance(input: {date: string}): Promise<SummarizeDailyAttendanceOutput> {
  if (!process.env.GEMINI_API_KEY) {
    return { summary: "⚠️ عذراً، لم يتم العثور على مفتاح الذكاء الاصطناعي (GEMINI_API_KEY). يرجى إضافته في إعدادات Netlify لتعمل هذه الميزة!" };
  }

  try {
    // جلب البيانات من قاعدة البيانات لحقنها في الذكاء الاصطناعي
    const { data: records, error } = await supabaseAdmin
      .from('attendance_records')
      .select('status, students(name), classes(name)')
      .eq('date', input.date);

    if (error) {
       return { summary: "حدث خطأ أثناء جلب البيانات من قاعدة البيانات." };
    }

    if (!records || records.length === 0) {
       return { summary: "لا توجد سجلات حضور مسجلة لهذا اليوم حتى يتمكن الذكاء الاصطناعي من تلخيصها." };
    }

    let presentCount = 0;
    let absentCount = 0;
    const missingByClass: Record<string, string[]> = {};

    records.forEach(r => {
        if (r.status === 'present') presentCount++;
        else {
            absentCount++;
            // @ts-ignore
            const cName = r.classes?.name || 'فصل غير معروف';
            // @ts-ignore
            const sName = r.students?.name || 'طالب غير معروف';
            if (!missingByClass[cName]) missingByClass[cName] = [];
            missingByClass[cName].push(sName);
        }
    });

    const total = presentCount + absentCount;
    const presentRate = ((presentCount / total) * 100).toFixed(1);
    
    let statsText = `إحصائيات اليوم (${input.date}):\n- الحضور: ${presentCount}\n- الغياب: ${absentCount}\n- نسبة الحضور: ${presentRate}%\n- تفاصيل الغياب في كل فصل:\n`;
    for (const [cls, students] of Object.entries(missingByClass)) {
        statsText += `  * ${cls}: ${students.join('، ')}\n`;
    }

    return await summarizeDailyAttendanceFlow({ date: input.date, stats: statsText });
  } catch (error: any) {
    console.error("AI summarization failed:", error);
    return { summary: "حدث خطأ داخلي أثناء التواصل مع الذكاء الاصطناعي. الرجاء التحقق من صحة المفتاح." };
  }
}

const summarizeDailyAttendancePrompt = ai.definePrompt({
  name: 'summarizeDailyAttendancePrompt',
  input: {schema: SummarizeDailyAttendanceInputSchema},
  output: {schema: SummarizeDailyAttendanceOutputSchema},
  prompt: `أنت مساعد ذكي لمديرة مدرسة. مهمتك هي قراءة هذه الإحصائيات الخاصة باليوم وصياغتها بطريقة احترافية وملخصة وذكية باللغة العربية.
  
المعلومات لليوم ({{date}}):
{{stats}}

اكتب ملخصاً في 3 نقاط محددة:
1- الحالة العامة للحضور.
2- الصف الذي به أكبر عدد من الغياب.
3- نصيحة سريعة أو تعليق إيجابي للمديرة.
`,
});

const summarizeDailyAttendanceFlow = ai.defineFlow(
  {
    name: 'summarizeDailyAttendanceFlow',
    inputSchema: SummarizeDailyAttendanceInputSchema,
    outputSchema: SummarizeDailyAttendanceOutputSchema,
  },
  async input => {
    const {output} = await summarizeDailyAttendancePrompt(input);
    return output!;
  }
);
