import TopNav from "@/components/nav/top-nav";
import Footer from "@/components/nav/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#F7F9FA] dark:bg-zinc-900">
        <TopNav />
        {children}
      </div>
      <Footer />
    </>
  );
}
