type StatsProps = {
  total_applications: string;
  active_interviews: string;
  offers: string;
  rejections: string;
};

export function DashboardStats({ stats }: { stats: StatsProps }) {
  const items = [
    { label: 'Total Applications', value: stats.total_applications },
    { label: 'Active Interviews', value: stats.active_interviews, highlight: true },
    { label: 'Offers', value: stats.offers, color: 'text-green-600' },
    { label: 'Rejections', value: stats.rejections, color: 'text-red-500' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mt-10 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className={`text-2xl font-bold ${item.color || 'text-zinc-900 dark:text-zinc-50'}`}>
            {item.value}
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}