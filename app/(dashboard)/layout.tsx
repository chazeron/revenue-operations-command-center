import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1800px]">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileNav />
        <div className="px-5 py-8 sm:px-7 lg:px-10 xl:px-14 xl:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
