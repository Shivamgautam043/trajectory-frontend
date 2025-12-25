import { ApplicationList } from "@/components/ApplicationList";
import { DashboardStats } from "@/components/dashboardStats";
import { getDashboardStats, getKanbanBoardData } from "@/lib/backend/user";

export default async function Home() {
  const statsResult = await getDashboardStats("a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891");
  const applicationsResult = await getKanbanBoardData("a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891");
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="grid w-full max-w-3xl grid-cols-1 place-items-start place-content-start px-12 py-16 text-center bg-white dark:bg-black">


        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Trajectory
        </h1>


        {/* <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Your career path, visualized.
        </p>

     
        <p className="mt-8 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Track job applications, visualize interview progress, capture learnings
          from each round, and stay focused on what truly matters — your growth
        </p>

        <div className="mt-14 rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
          🚀 Coming Soon I am grooot I am groot. I am groot. I am groot. I am groot. I am groot. I am groot. I am groot. I am groot. I am groot. I am groot.  I am groot. I am groot. I am groot.
        </div> */}
        {statsResult.success === true && (
          <DashboardStats stats={statsResult.data} />
        )}

        {/* Divider */}
        <div className="my-12 h-px w-full max-w-xl bg-zinc-200 dark:bg-zinc-800" />

        {/* Section Header */}
        <div className="flex w-full max-w-3xl items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Applications
          </h2>
          <button className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            View Board &rarr;
          </button>
        </div>

        {applicationsResult.success === true && (
          <ApplicationList applications={applicationsResult.data} />
        )}
      </main>
    </div>
  );
}
