import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-center px-8 py-32 text-center bg-white dark:bg-black">
        
        {/* Logo */}
        <div className="mb-10">
          {/* <Image
            src="/trajectory-logo.png" // add your logo in /public
            alt="Trajectory logo"
            width={120}
            height={120}
            priority
          /> */}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Trajectory
        </h1>

        {/* Tagline */}
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Your career path, visualized.
        </p>

        {/* Description */}
        <p className="mt-8 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Track job applications, visualize interview progress, capture learnings
          from each round, and stay focused on what truly matters — your growth
        </p>

        {/* Coming Soon */}
        <div className="mt-14 rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
          🚀 Coming Soon I am grooot I am groot. I am groot. I am groot. I am groot. I am groot. I am groot. I am groot. I am groot. I am groot. I am groot.  I am groot. I am groot. I am groot.  
        </div>
      </main>
    </div>
  );
}
