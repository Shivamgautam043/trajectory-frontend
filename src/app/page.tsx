import { AnalyticsSection } from "@/components/AnalyticsSection";
import { ApplicationList } from "@/components/ApplicationList";
import { AddApplicationModal } from "@/components/ApplicationModal";
import { DashboardStats } from "@/components/dashboardStats";
import { GoalTracker } from "@/components/GoalTracker";
import { SpotlightSection } from "@/components/SpotlightSection";
import { getAnalyticsData } from "@/lib/backend/application";
import { getDashboardStats, getKanbanBoardData } from "@/lib/backend/user";


export default async function Home() {
    const userId = "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891";
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 10);

    const [statsResult, applicationsResult, analyticsResult] = await Promise.all([
        getDashboardStats(userId),
        getKanbanBoardData(userId),
        getAnalyticsData(userId, startDate, endDate)
    ]);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayStats = analyticsResult.success
        ? analyticsResult.data.dailyTrend.find(d => d.date === todayStr)
        : null;
    const applicationsToday = todayStats ? todayStats.count : 0;
    const allApps = applicationsResult.success ? applicationsResult.data : [];
    const spotlightApps = allApps.filter(app =>
        app.priority === 'HIGH' || app.status === 'INTERVIEWING' || app.status === 'OFFER'
    ).slice(0, 3);

    const fullTrend = analyticsResult.success ? analyticsResult.data.dailyTrend : [];

    const weeklyTrend = fullTrend.slice(-7);

    return (
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="grid w-full grid-cols-1 place-items-start place-content-start px-12 py-16 text-center bg-white dark:bg-black">

                <div className="mb-8 w-full text-left max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Overview
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-5xl mx-auto mb-12">
                    <div className="lg:col-span-2 space-y-8">
                        {statsResult.success && <DashboardStats stats={statsResult.data} />}
                        {analyticsResult.success && (
                           <AnalyticsSection 
                        dailyTrend={weeklyTrend} 
                        statusDistribution={analyticsResult.data.statusDistribution}
                    />
                        )}
                    </div>

                    <div className="h-full flex flex-col">
                        <GoalTracker count={applicationsToday} />
                    </div>
                </div>
                <div className="my-8 h-px w-full max-w-5xl mx-auto bg-zinc-200 dark:bg-zinc-800" />
                <SpotlightSection apps={spotlightApps} />
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