import Link from "next/link";
import { ArrowRight, AlertCircle, Calendar } from "lucide-react";

type App = {
  application_id: string;
  company_name: string;
  role_title: string;
  status: string;
  priority: string | null;
  updated_at: Date; 
};

export function SpotlightSection({ apps }: { apps: App[] }) {
  if (apps.length === 0) return null;

  return (
    <div className="mb-10 w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="text-orange-500" size={20} />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Action Required / High Priority
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {apps.map((app) => (
          <Link 
            key={app.application_id} 
            href={`/applications/${app.application_id}`}
            className="group relative overflow-hidden rounded-lg border border-orange-200 bg-orange-50/50 p-5 hover:border-orange-300 hover:shadow-md transition-all dark:border-orange-900/30 dark:bg-orange-900/10 dark:hover:border-orange-800"
          >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
                    {app.status === 'INTERVIEWING' ? 'Interviewing' : 'High Priority'}
                </span>
                <ArrowRight size={16} className="text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </div>
            
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {app.company_name}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 truncate">
                {app.role_title}
            </p>

            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500 mt-auto">
                <Calendar size={12} />
                <span>Updated {new Date(app.updated_at).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}