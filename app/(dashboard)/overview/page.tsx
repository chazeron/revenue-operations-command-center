import type { Metadata } from "next";
import { OverviewClient } from "@/components/overview-client";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Overview",
};

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Executive Overview"
        title="Revenue intelligence for faster commercial decisions"
        description="Use the filters to explore how month, acquisition channel and closer assignment affect the complete revenue funnel."
      />
      <OverviewClient />
    </>
  );
}
