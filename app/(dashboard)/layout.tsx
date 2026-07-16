import { DashboardFilters } from "@/components/dashboard-filters";
import { FiltersProvider } from "@/components/filters-provider";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { SiteFooter } from "@/components/site-footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FiltersProvider>
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <MobileNav />
          <div className="px-5 py-8 sm:px-7 lg:px-10 xl:px-14 xl:py-12">
            <DashboardFilters />
            {children}
            <SiteFooter />
          </div>
        </div>
      </div>
    </FiltersProvider>
  );
}
