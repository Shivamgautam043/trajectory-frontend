'use client';

import { updateApplication } from "@/lib/backend/application";
import { Clock, ExternalLink, Loader2, Save } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

type HistoryItem = {
    id: string;
    new_status: string;
    notes: string | null;
    changed_at: string;
    interview_date: string;
};

type InterviewRound = {
    id: string;
    round_number: number;
    round_type: string;
    interview_date: string | null;
    interviewer_name: string | null;
    meeting_link: string | null;
    result: 'PASSED' | 'FAILED' | 'PENDING' | 'SKIPPED';
    personal_notes: string | null;
    created_at: string;
};

type Props = {
    app: any;
    history: HistoryItem[];
    rounds: InterviewRound[];
};

export function ApplicationDetailsView({ app, history, rounds }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const pathname = usePathname();

    async function handleUpdate(formData: FormData) {
        setIsSaving(true);
        const payload = {
            user_id: "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891",
            application_id: app.id,
            role_title: formData.get("role_title")?.toString() as string,
            job_link: formData.get("job_link")?.toString() as string,
            general_notes: formData.get("general_notes")?.toString() as string,
            status: formData.get("status")?.toString().toUpperCase() as any,
            priority: formData.get("priority")?.toString().toUpperCase() as any,
            revalidatePath: pathname
        };

        const result = await updateApplication(payload);
        setIsSaving(false);

        if (!result.success) {
            toast.error("Error: " + result.err.message);
        } else {
            toast.success("Changes saved");
        }
    }

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="relative lg:col-span-2 space-y-6">



                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <form
                        id="application-form"
                        ref={formRef}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdate(new FormData(e.currentTarget));
                        }}
                        className="space-y-4"
                    >

                        <h2 className="text-2xl font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-50">
                            {app.company_name}
                        </h2>
                        <input
                            name="role_title"
                            defaultValue={app.role_title}
                            className="w-full bg-transparent text-3xl font-bold text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-400"
                            placeholder="Role Title"
                        />
                        <div className="flex items-center gap-2">
                            <ExternalLink size={16} className="text-zinc-400" />
                            <input
                                name="job_link"
                                defaultValue={app.job_link || ""}
                                className="w-full bg-transparent text-sm text-blue-600 outline-none hover:underline dark:text-blue-400"
                                placeholder="Add Link to Job Posting..."
                            />
                        </div>

                    </form>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        General Notes
                    </h3>
                    <textarea
                        name="general_notes"
                        form="application-form"
                        defaultValue={app.general_notes || ""}
                        style={{ height: 400 }}
                        className="h-full w-full resize-none bg-transparent text-zinc-700 outline-none dark:text-zinc-300 leading-relaxed"
                        placeholder="Jot down details about the company, interview prep, or thoughts..."
                    />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Interview Rounds
                    </h3>

                    <div className="relative border-l border-zinc-200 pl-4 dark:border-zinc-800 space-y-6">
                        {rounds.length === 0 && (
                            <p className="text-xs text-zinc-500 italic">
                                No interview rounds added yet
                            </p>
                        )}
                        {rounds.map((round) => (
                            <div key={round.id} className="relative">
                                <div className="absolute -left-5.25 top-1 h-2.5 w-2.5 rounded-full bg-blue-500"></div>


                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                                    {round.round_type.replace('_', ' ')}{" "}
                                    <span className="text-xs text-zinc-500">
                                        (Round {round.round_number})
                                    </span>
                                </p>


                                <p className="text-xs text-zinc-500 mt-0.5">
                                    Created on{" "}
                                    {new Date(round.created_at).toLocaleDateString("en-IN")}
                                </p>
                                {round.interview_date && (
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Round on{" "}
                                        {new Date(round.interview_date).toLocaleDateString("en-IN")}
                                    </p>
                                )}

                                <span
                                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium
                        ${round.result === 'PASSED' && 'bg-green-100 text-green-700'}
                        ${round.result === 'FAILED' && 'bg-red-100 text-red-700'}
                        ${round.result === 'PENDING' && 'bg-yellow-100 text-yellow-700'}
                        ${round.result === 'SKIPPED' && 'bg-zinc-100 text-zinc-700'}
                    `}
                                >
                                    {round.result}
                                </span>

                                {round.personal_notes && (
                                    <p className="mt-1 text-xs text-zinc-500 italic dark:text-zinc-600">
                                        "{round.personal_notes}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>


            <div className="space-y-6">
                <div className="grid grid-cols-1 w-full place-items-end place-content-end">
                    <button
                        type="button"
                        onClick={() => formRef.current?.requestSubmit()}
                        disabled={isSaving}
                        className="top-4 right-4 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-zinc-500">
                                Status
                            </label>
                            <select
                                name="status"
                                form="application-form"
                                defaultValue={app.status}
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
                                form="application-form"
                                defaultValue={app.priority || "MEDIUM"}
                                className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-black dark:text-white"
                            >
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        <Clock size={16} /> Timeline
                    </h3>

                    <div className="relative border-l border-zinc-200 pl-4 dark:border-zinc-800 space-y-6">
                        {history.map((item: any) => (
                            <div key={item.id} className="relative">
                                <div className="absolute -left-5.25 top-1 h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>

                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                                    {item.new_status.charAt(0) +
                                        item.new_status.slice(1).toLowerCase()}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {new Date(item.changed_at).toLocaleDateString("en-IN")}
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
