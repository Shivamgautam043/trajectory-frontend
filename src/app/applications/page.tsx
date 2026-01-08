import { getKanbanBoardData } from "@/lib/backend/user";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { AddApplicationModal } from "@/components/ApplicationModal";


export default async function ApplicationsPage() {
  // TODO: Replace with dynamic user ID from session/cookie
  const userId = "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891";
  
  const result = await getKanbanBoardData(userId);

  return (
    <div className="min-h-screen bg-zinc-50 px-8 py-8 font-sans dark:bg-black">
      <div className="mx-auto max-w-6xl">
        
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Applications Board
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage and track all your job applications in one place.
            </p>
          </div>
          <AddApplicationModal />
        </div>

        {/* Content */}
        {result.success ? (
          <ApplicationsTable data={result.data} />
        ) : (
          <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            Error loading applications: {result.err.message}
          </div>
        )}
      </div>
    </div>
  );
}