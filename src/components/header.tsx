export default function Header() {
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

                {/* Center Navigation */}
                <div className="hidden md:flex items-center justify-center gap-8">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Dashboard</span>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Applications</span>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Insights</span>
                </div>
            </div>

            {/* Right: Profile */}
            <div className="flex justify-end">
                <div className="w-6 h-6 bg-zinc-300 rounded-full dark:bg-zinc-700 cursor-pointer" />
            </div>

        </header>
    );
}
