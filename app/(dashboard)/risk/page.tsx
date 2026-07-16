import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { RiskClient } from "@/components/risk-client";

export const metadata: Metadata = {
  title: "Revenue Risk",
};

export default function RiskPage() {
  return (
    <>
      <PageHeader
        eyebrow="Revenue Risk"
        title="Make hidden commercial losses visible"
        description="Financial risk metrics and lost reasons dynamically reflect the selected filters."
      />
      <RiskClient />
    </>
  );
}
