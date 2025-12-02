"use client";

import * as React from 'react';
import {Pie, PieChart, Cell} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type {CategorySpending} from '@/lib/types';

interface SpendingChartProps {
  data: CategorySpending[];
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

export function SpendingChart({data}: SpendingChartProps) {
  const chartData = data;

  const chartConfig = React.useMemo(() => {
    return chartData.reduce((acc, item, index) => {
      acc[item.name] = {
        label: item.name,
        color: chartColors[index % chartColors.length],
      };
      return acc;
    }, {} as any);
  }, [chartData]);
  

  const totalSpent = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.spent, 0);
  }, [data]);

  if (data.every(d => d.spent === 0)) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>
            Your spending breakdown will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            No spending data for this period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Monthly spending breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="spent"
              nameKey="name"
              innerRadius="50%"
              outerRadius="80%"
              strokeWidth={2}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
