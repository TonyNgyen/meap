// src/app/demo/layout.tsx
import { DemoProvider } from "@/providers/demo-provider";
import Link from "next/link";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider isDemo={true}>
      {/* Demo Mode Banner */}
      <div className="bg-gradient-to-r from-[#3A8F9E] to-[#2A6F7E] text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <span className="font-bold text-lg">Demo Mode</span>
              <span className="hidden sm:inline text-sm ml-2 opacity-90">
                - Try MEAP without signing up! All changes reset on refresh.
              </span>
            </div>
          </div>
          <Link href="/signup">
            <button className="px-5 py-2 bg-white text-[#3A8F9E] rounded-lg font-bold hover:bg-zinc-100 transition-colors shadow-md">
              Sign Up Free
            </button>
          </Link>
        </div>
      </div>
      
      {/* Demo Content */}
      {children}
    </DemoProvider>
  );
}