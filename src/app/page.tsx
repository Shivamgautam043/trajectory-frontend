import { ApplicationList } from "@/components/ApplicationList";
import { AddApplicationModal } from "@/components/ApplicationModal";
import { DashboardStats } from "@/components/dashboardStats";
import { getDashboardStats, getKanbanBoardData } from "@/lib/backend/user";

export default async function Home() {
  const statsResult = await getDashboardStats(
    "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891",
  );
  const applicationsResult = await getKanbanBoardData(
    "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891",
  );

  return (
    <div className=" bg-zinc-50 font-sans dark:bg-black">
      <main className="grid w-full max-w-3xl grid-cols-1 place-items-start place-content-start px-12 py-16 text-center bg-white dark:bg-black">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Trajectory
        </h1>
        {statsResult.success === true && (
          <DashboardStats stats={statsResult.data} />
        )}

        {/* Divider */}
        <div className="my-12 h-px w-full max-w-xl bg-zinc-200 dark:bg-zinc-800" />

        {/* Section Header */}
        <div className="flex w-full max-w-4xl items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Applications
          </h2>
          {/* Replaced the old "View Board" text link with the new Modal Component */}
          <div className="flex items-center gap-4">
            <AddApplicationModal />
          </div>
        </div>

        {applicationsResult.success === true && (
          <ApplicationList applications={applicationsResult.data} />
        )}
      </main>
    </div>
  );
}
