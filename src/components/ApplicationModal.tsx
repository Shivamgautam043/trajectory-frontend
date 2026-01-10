// components/AddApplicationModal.tsx
'use client'

import { addApplication } from "@/lib/backend/application";
import { usePathname } from "next/navigation";
import { useState } from "react";


export function AddApplicationModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.currentTarget);
        const roleTitle = formData.get("roleTitle") as string;
        const priority = formData.get("priority") as "HIGH" | "MEDIUM" | "LOW";
        const status = formData.get("status") as
            | "APPLIED"
            | "INTERVIEWING"
            | "OFFER"
            | "REJECTED"
            | "WITHDRAWN";

        const result = await addApplication({
            user_id: "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891",
            company_id: "ab64ef05-2f88-47e8-b081-2ce56e9a6405",
            role_title: roleTitle,
            priority,
            status,
            revalidatePath: pathname
        });

        setIsLoading(false);

        if (result.success) {
            setIsOpen(false);
            // event.currentTarget.reset();
        } else {
            alert("Error: " + result.err.message);
        }
    }


    return (
        <>

            <button
                onClick={() => setIsOpen(true)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
                + Add Application
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">

                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                New Application
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Company Name
                                </label>
                                <input
                                    name="companyName"
                                    type="text"
                                    required
                                    placeholder="e.g. Acme Corp"
                                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Role Title
                                </label>
                                <input
                                    name="roleTitle"
                                    type="text"
                                    required
                                    placeholder="e.g. Frontend Engineer"
                                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Job Link (Optional)
                                </label>
                                <input
                                    name="jobLink"
                                    type="url"
                                    placeholder="https://..."
                                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                    >
                                        <option value="APPLIED">Applied</option>
                                        <option value="INTERVIEWING">Interviewing</option>
                                        <option value="OFFER">Offer</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="WITHDRAWN">Withdrawn</option>
                                    </select>
                                </div>


                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        defaultValue="MEDIUM"
                                        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                    >
                                        <option value="HIGH">High</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="LOW">Low</option>
                                    </select>
                                </div>
                            </div>


                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {isLoading ? 'Saving...' : 'Save Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}