import { ApplicationList } from "@/components/ApplicationList";
import { AddApplicationModal } from "@/components/ApplicationModal"; // Check your import path, in previous turn it was components/AddApplicationModal
import { DashboardStats } from "@/components/dashboardStats";
import { AnalyticsSection } from "@/components/AnalyticsSection"; // Import the new component
import { getDashboardStats, getKanbanBoardData } from "@/lib/backend/user";
import { getAnalyticsData } from "@/lib/backend/application";


export default async function Home() {
  const userId = "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891";

  // Calculate Date Range (Last 7 Days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7); // Go back 6 days + today = 7 days

  // Parallel Data Fetching
  const [statsResult, applicationsResult, analyticsResult] = await Promise.all([
    getDashboardStats(userId),
    getKanbanBoardData(userId),
    getAnalyticsData(userId, startDate, endDate)
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="grid w-full grid-cols-1 place-items-start place-content-start px-12 py-16 text-center bg-white dark:bg-black">
        
        {/* Header */}
        <div className="mb-8 w-full text-left max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Overview
            </h1>
        </div>

        {/* 1. Stats Cards */}
        <div className="w-full max-w-5xl mx-auto mb-8">
            {statsResult.success === true && (
            <DashboardStats stats={statsResult.data} />
            )}
        </div>

        {/* 2. NEW: Analytics Graphs */}
        <div className="w-full max-w-5xl mx-auto mb-12">
            {analyticsResult.success === true && (
                <AnalyticsSection 
                    dailyTrend={analyticsResult.data.dailyTrend}
                    statusDistribution={analyticsResult.data.statusDistribution}
                />
            )}
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full max-w-5xl mx-auto bg-zinc-200 dark:bg-zinc-800" />

        {/* 3. Recent Applications List */}
        <div className="w-full max-w-5xl mx-auto">
            <div className="flex w-full items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Recent Applications
                </h2>
                <AddApplicationModal />
            </div>

            {applicationsResult.success === true && (
                <ApplicationList applications={applicationsResult.data} />
            )}
        </div>

      </main>
    </div>
  );
}