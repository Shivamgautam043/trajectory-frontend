
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { AddApplicationModal } from "@/components/ApplicationModal";
import { SearchInput } from "@/components/SearchInput";
import { getApplicationsForUser } from "@/lib/backend/application";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
  }>;
};

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const userId = "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891";
  const search = params.q ?? "";
  const page = Number(params.page ?? "1");
  const limit = Number(params.limit ?? "5");

  const result = await getApplicationsForUser(userId, {
    search,
    page,
    limit,
  });

  return (
    <div className="min-h-screen bg-zinc-50 px-8 py-8 dark:bg-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Applications Board
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage and track all your job applications.
            </p>
          </div>
          <AddApplicationModal />
        </div>
        <SearchInput defaultValue={search} />
        {result.success ? (
          <ApplicationsTable
            data={result.data.items}
            total={result.data.total}
            page={page}
            limit={limit}
          />
        ) : (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">
            {result.err.message}
          </div>
        )}
      </div>
    </div>
  );
}
