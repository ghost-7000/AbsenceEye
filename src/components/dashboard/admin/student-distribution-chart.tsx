'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ClassWithStudentCount } from '@/app/actions/admin-actions';
import { CardDescription } from '@/components/ui/card';

interface StudentDistributionChartProps {
  data: ClassWithStudentCount[];
}

const chartConfig = {
  students: {
    label: 'الطلاب',
  },
};

export function StudentDistributionChart({ data }: StudentDistributionChartProps) {
  if (!data || data.length === 0) {
    return <CardDescription>لا توجد بيانات كافية لعرض الرسم البياني.</CardDescription>;
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{
          left: 10,
          right: 10,
        }}
        dir="rtl"
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
          className="fill-muted-foreground"
        />
        <XAxis dataKey="studentCount" type="number" hide />
        <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
        />
        <Bar
          dataKey="studentCount"
          layout="vertical"
          fill="hsl(var(--primary))"
          radius={4}
        >
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
