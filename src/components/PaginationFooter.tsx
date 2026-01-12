"use client";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  total: number;
  page: number;
  limit: number;
};

export function PaginationFooter({ total, page, limit }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / limit);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Rows per page</span>
        <select
          value={limit}
          onChange={(e) =>
            updateParams({
              limit: e.target.value,
              page: "1",
            })
          }
          className="rounded-md border px-2 py-1 text-sm dark:bg-black"
        >
          {[5, 10, 20].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button
          disabled={page <= 1}
          onClick={() => updateParams({ page: String(page - 1) })}
          className="rounded-md border px-3 py-1 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-zinc-600 dark:text-zinc-400">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => updateParams({ page: String(page + 1) })}
          className="rounded-md border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
