// import { title } from "@/components/primitives";
import React from "react";

import ThreatList from "@/components/feeds/threatlist";
import SubPageLayout from "@/layouts/subpage";

export default function DocsPage() {
  return (
    <SubPageLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-2">
        <ThreatList />
      </section>
    </SubPageLayout>
  );
}
