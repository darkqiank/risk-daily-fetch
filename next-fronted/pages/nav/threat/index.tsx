// import { title } from "@/components/primitives";
import React from "react";

import ThreatList from "@/components/feeds/threatlist";

export default function DocsPage() {
  return (
    // <DefaultLayout>
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <ThreatList />
    </section>
    // </DefaultLayout>
  );
}
