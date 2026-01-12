
import { ApplicationDetailsView } from "@/components/ApplicationDetailsView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getApplicationDetails } from "@/lib/backend/application";

export default async function ApplicationDetailPage({ params }: { params: { applicationId: string } }) {
    const { applicationId } = await params;
    const userId = "a1fcb8b1-2f90-4a64-9b1b-02dfbadc9891"; // Hardcoded for now

    const result = await getApplicationDetails(userId, applicationId);

    if (!result.success) {
        return (
            <div className="p-12 text-center text-red-500">
                Application not found or error loading data.
                {result.err.message}
            </div>
        );
    }

    const { application, history, rounds } = result.data;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/applications"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                    <ArrowLeft size={16} /> Back to Board
                </Link>
                <ApplicationDetailsView app={application} history={history} rounds={rounds}/>
            </div>
        </div>
    );
}