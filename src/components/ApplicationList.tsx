import { ApplicationCard } from './ApplicationCard';

type ListProps = {
  applications: Array<{
    application_id: string;
    company_name: string;
    role_title: string;
    status: any;
    priority: any;
    updated_at: Date;
  }>
};

export function ApplicationList({ applications }: ListProps) {
  if (applications.length === 0) {
    return (
      <div className="mt-12 text-center text-sm text-zinc-500">
        No active applications found. Time to apply!
      </div>
    );
  }

  return (
    <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
      {applications.map((app) => (
        <ApplicationCard key={app.application_id} app={app} />
      ))}
    </div>
  );
}