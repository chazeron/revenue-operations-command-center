import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { TeamClient } from "@/components/team-client";

export const metadata: Metadata = {
  title: "Sales Team",
};

export default function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sales Team"
        title="Compare closer output, efficiency and revenue contribution"
        description="The ranking updates dynamically based on the selected month and acquisition channel."
      />
      <TeamClient />
    </>
  );
}
