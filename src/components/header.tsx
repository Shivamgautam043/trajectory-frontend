import { User } from "@/utilities/types";

export default function Header({ user }: { user: User | null }) {
    return (
        <header className="w-full h-19 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black grid grid-flow-col items-center px-6">
            {/* Left: Logo */}
            <div className="flex items-center gap-12">
                <div className="flex items-center gap-2">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3616/3616639.png"
                        alt="Trajectory Logo"
                        width={36}
                        height={36}
                    />
                    <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                        Trajectory
                    </span>
                </div>
                <div className="hidden md:flex items-center justify-center gap-8">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Dashboard</span>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Applications</span>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Insights</span>
                </div>
            </div>

            {/* Right: Profile */}
            <div className="flex justify-end">
                {user ? (
                    /* Logged-in: profile circle */
                    <div
                        className="w-8 h-8 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer grid place-items-center text-sm font-medium text-zinc-900 dark:text-zinc-100"
                    >
                        {user.full_name.charAt(0)}
                    </div>
                ) : (
                    /* Logged-out: Sign-in button */
                    <a
                        href="/sign-in"
                        className="px-4 py-1.5 rounded-md text-sm font-medium 
                       bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100
                       hover:bg-zinc-300 dark:hover:bg-zinc-600
                       transition-colors duration-200 cursor-pointer"
                    >
                        Sign in
                    </a>
                )}
            </div>

        </header>
    );
}
