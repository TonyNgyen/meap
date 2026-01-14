import type { Metadata } from "next";
import "../globals.css";
import SidebarNav from "@/components/sidebar-nav";
import AuthFooter from "@/components/auth-footer";
import { DemoProvider } from "@/providers/demo-provider";
import Link from "next/link";

export const metadata: Metadata = {
  title: "meap",
  description: "Meal prep and planning app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider isDemo={true}>
      {/* Demo Mode Banner - Fixed at top of viewport */}
      {/* <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#3A8F9E] to-[#2A6F7E] text-white py-3 px-4 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div>
              <span className="font-bold text-lg">Demo Mode</span>
              <span className="hidden sm:inline text-sm ml-2 opacity-90">
                - Try MEAP without signing up! Changes reset on refresh.
              </span>
            </div>
          </div>
          <Link href="/signup">
            <button className="px-5 py-2 bg-white text-[#3A8F9E] rounded-lg font-bold hover:bg-zinc-100 transition-colors shadow-md">
              Sign Up Free
            </button>
          </Link>
        </div>
      </div> */}

      {/* Main Layout - Same as authenticated layout but REPLACE the outer wrapper */}
      <div className="flex h-screen">
        <SidebarNav isAdmin={false} isDemo={true} />

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 p-6 bg-[#F7F9FA] dark:bg-zinc-900">
            {children}
          </div>

          <AuthFooter />
        </div>
      </div>
    </DemoProvider>
  );
}
