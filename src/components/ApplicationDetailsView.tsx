'use client';

// Make sure to import your actual backend functions here
import { updateApplication } from "@/lib/backend/application"; 
import { addInterviewRound, deleteInterviewRound } from "@/lib/backend/interviewRound";


import { Clock, ExternalLink, Loader2, Save, Pencil, Trash2, Plus, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

// Types (Kept as provided)
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
    
    // New states for Round Management
    const [isEditingRounds, setIsEditingRounds] = useState(false);
    const [isAddingRound, setIsAddingRound] = useState(false);
    const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);

    const formRef = useRef<HTMLFormElement>(null);
    const roundFormRef = useRef<HTMLFormElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Existing Update Handler
    async function handleUpdate(formData: FormData) {
        setIsSaving(true);
        const payload = {
            user_id: "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891", // Assuming static for now as per your code
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

    // New: Handle Delete Round
    async function handleDeleteRound(roundId: string) {
        if (!confirm("Are you sure you want to delete this round?")) return;
        
        setDeletingRoundId(roundId);
        const result = await deleteInterviewRound({
            round_id: roundId,
            user_id: "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891" // Using same ID as your update logic
        });
        setDeletingRoundId(null);

        if (!result.success) {
            toast.error(result.err.message);
        } else {
            toast.success("Round deleted");
            router.refresh();
        }
    }

    // New: Handle Add Round
    async function handleAddRound(formData: FormData) {
        setIsAddingRound(true);
        
        const dateStr = formData.get("interview_date")?.toString();

        const payload = {
            job_application_id: app.id,
            round_number: parseInt(formData.get("round_number")?.toString() || "1"),
            round_type: formData.get("round_type")?.toString() || "General",
            interviewer_name: formData.get("interviewer_name")?.toString() || undefined,
            meeting_link: formData.get("meeting_link")?.toString() || undefined,
            interview_date: dateStr ? new Date(dateStr) : undefined,
        };

        const result = await addInterviewRound(payload);
        setIsAddingRound(false);

        if (!result.success) {
            toast.error(result.err.message);
        } else {
            toast.success("Round added successfully");
            roundFormRef.current?.reset();
            router.refresh();
        }
    }

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="relative lg:col-span-2 space-y-6">
                
                {/* Header Card */}
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

                {/* Notes Card */}
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

                {/* Interview Rounds Card (MODIFIED) */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Interview Rounds
                        </h3>
                        
                        {/* Edit Toggle Button */}
                        <button 
                            onClick={() => setIsEditingRounds(!isEditingRounds)}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        >
                            {isEditingRounds ? <X size={18} /> : <Pencil size={18} />}
                        </button>
                    </div>

                    <div className="relative border-l border-zinc-200 pl-4 dark:border-zinc-800 space-y-6">
                        {rounds.length === 0 && !isEditingRounds && (
                            <p className="text-xs text-zinc-500 italic">
                                No interview rounds added yet
                            </p>
                        )}

                        {rounds.map((round) => (
                            <div key={round.id} className="relative group">
                                <div className="absolute -left-5.25 top-1 h-2.5 w-2.5 rounded-full bg-blue-500"></div>

                                <div className="flex items-start justify-between">
                                    <div>
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
                                        {round.meeting_link && (
                                           <a href={round.meeting_link} target="_blank" className="text-xs text-blue-500 hover:underline block mt-0.5">
                                               Meeting Link
                                           </a> 
                                        )}
                                    </div>

                                    {/* Delete Option (Visible in Edit Mode) */}
                                    {isEditingRounds && (
                                        <button 
                                            onClick={() => handleDeleteRound(round.id)}
                                            disabled={deletingRoundId === round.id}
                                            className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all"
                                        >
                                            {deletingRoundId === round.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Status Badges */}
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

                        {/* Add New Round Form (Visible in Edit Mode) */}
                        {isEditingRounds && (
                            <div className="relative pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Add New Round</h4>
                                <form 
                                    ref={roundFormRef}
                                    action={handleAddRound}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                >
                                    <div className="col-span-1">
                                        <input 
                                            name="round_type" 
                                            required 
                                            placeholder="Type (e.g. Technical, HR)" 
                                            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-black dark:text-white"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <input 
                                            name="round_number" 
                                            type="number" 
                                            defaultValue={rounds.length + 1}
                                            required 
                                            placeholder="Round No." 
                                            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-black dark:text-white"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <input 
                                            name="interviewer_name" 
                                            placeholder="Interviewer Name" 
                                            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-black dark:text-white"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <input 
                                            name="interview_date" 
                                            type="datetime-local"
                                            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-black dark:text-white text-zinc-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            name="meeting_link" 
                                            type="url"
                                            placeholder="Meeting Link (Optional)" 
                                            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-black dark:text-white"
                                        />
                                    </div>
                                    
                                    <div className="col-span-2 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isAddingRound}
                                            className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                        >
                                            {isAddingRound ? <Loader2 size={12} className="animate-spin"/> : <Plus size={12} />}
                                            Add Round
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar (Status & History) - Unchanged Logic */}
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