"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(defaultValue);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    if (value === currentQuery) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("q", value);
        params.set("page", "1");
      } else {
        params.delete("q");
      }

      router.push(`?${params.toString()}`);
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, currentQuery, router]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search by company or role..."
      className="mb-6 w-full rounded-md border px-3 py-2 text-sm dark:border-[#333333] focus:outline-[1px] dark:text-white"
    />
  );
}
