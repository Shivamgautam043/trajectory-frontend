"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    KanbanSquare,
    Building2,
    PieChart,
    Settings,
    ChevronLeft,
    ChevronRight,
    FileText,
    Home
} from "lucide-react";

const ROUTES = [
    { name: "Home", path: "/", icon: Home },
    // { name: "Home", path: "/", icon: LayoutDashboard },
    { name: "Applications", path: "/applications", icon: KanbanSquare },
    { name: "Companies", path: "/companies", icon: Building2 },
    { name: "Documents", path: "/documents", icon: FileText },
    { name: "Analytics", path: "/analytics", icon: PieChart },
];

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const pathname = usePathname();
    return (
        <aside
            className={`relative flex flex-col h-screen bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out ${isCollapsed ? "w-16" : "w-60"}`}
        >

            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* <div className="flex items-center gap-3 p-4 h-16">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                    <span className="font-bold text-lg">T</span>
                </div>

                <div
                    className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        }`}
                >
                    <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                        Trajectory
                    </span>
                </div>
            </div> */}

            <nav className="flex-1 space-y-2 px-2 py-4">
                {ROUTES.map((route) => {
                    const isActive = pathname === route.path;

                    return (
                        <Link
                            key={route.path}
                            href={route.path}
                            className={`
                group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200
                ${isActive
                                    ? "bg-zinc-100 text-blue-600 dark:bg-zinc-900 dark:text-blue-400"
                                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200"
                                }
              `}
                            title={isCollapsed ? route.name : ""}
                        >
                            <route.icon
                                size={20}
                                className={`shrink-0 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                                    }`}
                            />
                            <span
                                className={`whitespace-nowrap font-medium transition-all duration-300 ${isCollapsed ? "w-0 translate-x-4 opacity-0 overflow-hidden" : "w-auto translate-x-0 opacity-100"
                                    }`}
                            >
                                {route.name}
                            </span>

                            {isActive && !isCollapsed && (
                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                <Link
                    href="/settings"
                    className={`
            group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200
            ${pathname === "/settings"
                            ? "bg-zinc-100 text-blue-600 dark:bg-zinc-900 dark:text-blue-400"
                            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200"
                        }
            `}
                >
                    <Settings size={20} className="shrink-0" />
                    <span
                        className={`whitespace-nowrap font-medium transition-all duration-300 ${isCollapsed ? "w-0 translate-x-4 opacity-0 overflow-hidden" : "w-auto translate-x-0 opacity-100"
                            }`}
                    >
                        Settings
                    </span>
                </Link>
            </div>
        </aside>
    );
}