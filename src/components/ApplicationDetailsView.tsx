"use client";

import { useState } from "react";

import { ExternalLink, Calendar, Clock, Save } from "lucide-react";

type Props = {
    app: any; // Using 'any' for brevity, ideally use the Zod inferred type
    history: any[];
};

export function ApplicationDetailsView({ app, history }: Props) {
    const [isSaving, setIsSaving] = useState(false);

    // We use a simple form submission for updates.
    // For a better UX, 'onBlur' saving for text areas is great.

    async function handleUpdate(formData: FormData) {
        setIsSaving(true);
        // Append ID manually since it's not an input field
        formData.append("application_id", app.id);

        await updateApplicationAction(formData);
        setIsSaving(false);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* --- LEFT COLUMN: Main Editor --- */}
            <div className="lg:col-span-2 space-y-6">

                {/* Header Section */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <form action={handleUpdate} className="space-y-4">
                        {/* We use hidden inputs to keep values that aren't being changed in this specific partial update, 
                    OR we rely on the backend COALESCE to ignore missing fields. 
                    Ideally, we put ALL current values as defaults. */}

                        {/* Company Name (Read Only) */}
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            {app.company_name}
                        </h2>

                        {/* Role Title (Editable) */}
                        <input
                            name="role_title"
                            defaultValue={app.role_title}
                            className="w-full bg-transparent text-3xl font-bold text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-50"
                            placeholder="Role Title"
                            onBlur={(e) => e.target.form?.requestSubmit()}
                        />

                        {/* Job Link */}
                        <div className="flex items-center gap-2">
                            <ExternalLink size={16} className="text-zinc-400" />
                            <input
                                name="job_link"
                                defaultValue={app.job_link || ""}
                                className="w-full bg-transparent text-sm text-blue-600 outline-none hover:underline dark:text-blue-400"
                                placeholder="Add Link to Job Posting..."
                                onBlur={(e) => e.target.form?.requestSubmit()}
                            />
                        </div>
                    </form>
                </div>

                {/* Notes Section */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 h-[400px]">
                    <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        General Notes
                    </h3>
                    <form action={handleUpdate} className="h-full pb-8">
                        <textarea
                            name="general_notes"
                            defaultValue={app.general_notes || ""}
                            className="h-full w-full resize-none bg-transparent text-zinc-700 outline-none dark:text-zinc-300 leading-relaxed"
                            placeholder="Jot down details about the company, interview prep, or thoughts..."
                            onBlur={(e) => e.target.form?.requestSubmit()}
                        />
                    </form>
                </div>
            </div>

            {/* --- RIGHT COLUMN: Sidebar --- */}
            <div className="space-y-6">

                {/* Status & Priority Card */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <form action={handleUpdate} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-zinc-500">
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue={app.status}
                                onChange={(e) => e.target.form?.requestSubmit()}
                                className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-black dark:text-white"
                            >
                                <option value="APPLIED">Applied</option>
                                <option value="SHORTLISTED">Shortlisted</option>
                                <option value="INTERVIEWING">Interviewing</option>
                                <option value="OFFER">Offer</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="WITHDRAWN">Withdrawn</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-zinc-500">
                                Priority
                            </label>
                            <select
                                name="priority"
                                defaultValue={app.priority || "MEDIUM"}
                                onChange={(e) => e.target.form?.requestSubmit()}
                                className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-black dark:text-white"
                            >
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>

                        {isSaving && <p className="text-xs text-green-500 animate-pulse text-right">Saving...</p>}
                    </form>
                </div>

                {/* Timeline / History */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        <Clock size={16} /> Timeline
                    </h3>
                    <div className="relative border-l border-zinc-200 pl-4 dark:border-zinc-800 space-y-6">
                        {history.map((item: any) => (
                            <div key={item.id} className="relative">
                                {/* Dot */}
                                <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>

                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                                    {item.new_status.charAt(0) + item.new_status.slice(1).toLowerCase()}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </p>
                                {item.notes && (
                                    <p className="mt-1 text-xs text-zinc-500 italic dark:text-zinc-600">
                                        "{item.notes}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

function updateApplicationAction(formData: FormData) {
    throw new Error("Function not implemented.");
}
