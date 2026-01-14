import { Application } from "@/utilities/types";
import Link from "next/link";

export function ApplicationCard({ app }: { app: Application }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OFFER":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "INTERVIEWING":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };
  return (
    <Link key={app.id} href={`/applications/${app.id}`}>
      <div className="group relative flex flex-col items-start justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600">
        <div className="w-full">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            {app.company_name}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {app.role_title}
          </p>
        </div>
        <div className="mt-4 flex w-full items-center justify-between">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
              app.status
            )}`}
          >
            {app.status}
          </span>
          {app.priority === "HIGH" && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-xs text-zinc-500">High Priority</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
