// SummarizeDailyAttendance flow generates a summary of daily attendance for admins.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDailyAttendanceInputSchema = z.object({
  date: z.string().describe('The date for which to summarize attendance, in YYYY-MM-DD format.'),
});

export type SummarizeDailyAttendanceInput = z.infer<typeof SummarizeDailyAttendanceInputSchema>;

const SummarizeDailyAttendanceOutputSchema = z.object({
  summary: z.string().describe('A summary of the daily attendance across the school.'),
});

export type SummarizeDailyAttendanceOutput = z.infer<typeof SummarizeDailyAttendanceOutputSchema>;

export async function summarizeDailyAttendance(input: SummarizeDailyAttendanceInput): Promise<SummarizeDailyAttendanceOutput> {
  return summarizeDailyAttendanceFlow(input);
}

const summarizeDailyAttendancePrompt = ai.definePrompt({
  name: 'summarizeDailyAttendancePrompt',
  input: {schema: SummarizeDailyAttendanceInputSchema},
  output: {schema: SummarizeDailyAttendanceOutputSchema},
  prompt: `أنت مساعد ذكي لمديرة مدرسة. مهمتك هي تلخيص سجلات الحضور والغياب للمدرسة في تاريخ {{date}}.

قدم ملخصًا واضحًا ومنظمًا باللغة العربية الفصحى. يجب أن يتضمن الملخص النقاط التالية إن وجدت بيانات كافية:
- النسبة المئوية الإجمالية للحضور في المدرسة.
- قائمة بالصفوف التي لديها أعلى نسبة غياب، مع ذكر عدد الطلاب الغائبين في كل صف.
- أي ملاحظات أو أنماط غير اعتيادية تلاحظها في بيانات الحضور لهذا اليوم.

اجعل الملخص على شكل نقاط لتسهيل القراءة.
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
