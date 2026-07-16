import type { Metadata } from "next";
import { FunnelClient } from "@/components/funnel-client";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Sales Funnel",
};

export default function FunnelPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sales Funnel"
        title="Understand where revenue momentum is created or lost"
        description="Every stage and conversion rate updates based on the selected month, channel and closer."
      />
      <FunnelClient />
    </>
  );
}
