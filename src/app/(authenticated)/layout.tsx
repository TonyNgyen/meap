import SidebarNav from "@/components/sidebar-nav";
import AuthFooter from "@/components/auth-footer";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import "../globals.css";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  const isAdmin = user?.id === process.env.ADMIN_USER_ID;

  return (
    <main className="flex h-screen">
      <SidebarNav isAdmin={isAdmin} isDemo={false} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-6 bg-[#F7F9FA] dark:bg-zinc-900">
          {children}
        </main>

        <AuthFooter />
      </div>
    </main>
  );
}
