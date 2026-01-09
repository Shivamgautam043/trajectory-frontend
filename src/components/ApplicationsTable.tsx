"use client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
type Application = {
  application_id: string;
  company_name: string;
  company_location: string | null;
  role_title: string;
  status: "APPLIED" | "SHORTLISTED" | "INTERVIEWING" | "OFFER" | "REJECTED" | "WITHDRAWN";
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
  applied_date: Date;
  updated_at: Date;
};

// Helper for Status Badge Colors
const getStatusStyles = (status: string) => {
  switch (status) {
    case "OFFER":
      return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20";
    case "INTERVIEWING":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
    case "SHORTLISTED":
      return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
    case "REJECTED":
      return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20";
    case "WITHDRAWN":
      return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";
    default: // APPLIED
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
  }
};

// Helper for Priority Colors
const getPriorityStyles = (priority: string | null) => {
    if (priority === "HIGH") return "text-red-600 dark:text-red-400 font-medium";
    if (priority === "MEDIUM") return "text-orange-600 dark:text-orange-400";
    return "text-zinc-500 dark:text-zinc-500";
};

export function ApplicationsTable({ data }: { data: Application[] }) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
        <p className="text-zinc-500">No applications found.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-black">
      <table className="w-full text-left text-sm">
        {/* Table Header */}
        <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400">
          <tr>
            <th className="px-6 py-4 font-medium">Company</th>
            <th className="px-6 py-4 font-medium">Role</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Priority</th>
            <th className="px-6 py-4 font-medium text-right">Applied</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {data.map((app) => (
            <tr
              key={app.application_id}
              onClick={() => router.push(`/applications/${app.application_id}`)}
              className="group cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            >
              {/* Company Column */}
              <td className="px-6 py-4">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {app.company_name}
                </div>
                {app.company_location && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-500">
                    {app.company_location}
                  </div>
                )}
              </td>

              {/* Role Column */}
              <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                {app.role_title}
              </td>

              {/* Status Column */}
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyles(
                    app.status
                  )}`}
                >
                  {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                </span>
              </td>

              {/* Priority Column */}
              <td className="px-6 py-4">
                 <span className={`text-xs ${getPriorityStyles(app.priority)}`}>
                    {app.priority || "-"}
                 </span>
              </td>

              {/* Date Column */}
              <td className="px-6 py-4 text-right text-zinc-500 dark:text-zinc-400">
                {new Date(app.applied_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}