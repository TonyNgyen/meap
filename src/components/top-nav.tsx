import React from "react";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function TopNav() {
  return (
    <header className="w-full bg-[#F7F9FA] dark:bg-zinc-900 ">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-16 flex justify-between items-center py-4">
        <Link href="/" className="text-xl font-sans font-medium">
          meap
        </Link>

        <div className="flex items-center gap-2 md:gap-4 transition-all">
          <Link
            href="/demo"
            className="px-4 py-1 rounded-sm bg-[#3A8F9E] text-white hover:bg-[#337E8D] transition-all duration-300 font-semibold tracking-wide flex items-center"
          >
            Try Demo
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
