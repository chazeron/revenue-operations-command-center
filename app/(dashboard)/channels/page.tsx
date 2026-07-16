import type { Metadata } from "next";
import { ChannelsClient } from "@/components/channels-client";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Channels",
};

export default function ChannelsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Acquisition Channels"
        title="Compare volume, efficiency and commercial return"
        description="Channel performance dynamically reflects the active month and closer filters."
      />
      <ChannelsClient />
    </>
  );
}
