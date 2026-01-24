"use client";
import { AreaChart, DonutChart } from '@mantine/charts';


type Props = {
  dailyTrend: { date: string; count: number }[];
  statusDistribution: { name: string; value: number; color: string }[];
};

export function AnalyticsSection({ dailyTrend, statusDistribution }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100 text-start">
          Activity
        </h3>
        <AreaChart
          h={150}
          data={dailyTrend}
          dataKey="date"
          series={[
            { name: 'count', color: 'blue.6', label: 'Applications' }
          ]}
          curveType="linear"
          tickLine="none"
          gridAxis="x"
          withDots={true}
          withGradient={true}
          className="text-zinc-500"
      
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100 text-start">
          Pipeline Health
        </h3>
        <div className="flex items-center justify-center">
          <DonutChart
            data={statusDistribution}
            withTooltip
            tooltipDataSource="segment"
            size={120}
            thickness={10}
            withLabelsLine
            paddingAngle={2}
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {statusDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: `var(--mantine-color-${item.color.replace('.', '-')})` }}
              ></span>
              {item.name} ({item.value})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}