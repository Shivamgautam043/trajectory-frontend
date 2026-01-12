"use client";

import { RingProgress, Text, Center, ThemeIcon, rem } from '@mantine/core';
import { Check } from 'lucide-react';
import { MantineProvider } from '@mantine/core';

export function GoalTracker({ count }: { count: number }) {
    const GOAL = 10;
    const progress = Math.min((count / GOAL) * 100, 100);
    const remaining = Math.max(GOAL - count, 0);

    return (
        <MantineProvider>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Daily Goal
                    </h3>
                    <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                        {count} / {GOAL}
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <RingProgress
                        size={80}
                        thickness={8}
                        // roundCaps
                        sections={[{ value: progress, color: progress >= 100 ? 'green' : 'blue' }]}
                        label={
                            <Center>
                                {progress >= 100 ? (
                                    <ThemeIcon color="green" variant="light" radius="xl" size="xl">
                                        <Check style={{ width: rem(22), height: rem(22) }} />
                                    </ThemeIcon>
                                ) : (
                                    <div className='text-sm font-semibold dark:text-white'>
                                        {Math.round(progress)}%
                                    </div>
                                )}
                            </Center>
                        }
                    />

                    <div className="flex flex-col">
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">
                            {progress >= 100
                                ? "Goal crushed! 🚀"
                                : `${remaining} more to go.`}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                            Consistency is key.
                        </p>
                    </div>
                </div>
            </div>
        </MantineProvider>
    );
}