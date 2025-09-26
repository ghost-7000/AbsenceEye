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
  prompt: `You are a helpful assistant for a school admin.
  Summarize the daily attendance records for the school on {{date}}.
  Provide a concise summary of the overall attendance trends and any notable patterns.
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
