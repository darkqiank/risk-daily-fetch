// import { title } from "@/components/primitives";
import React from "react";

import ContentList from "@/components/feeds/detail_list";
import SubPageLayout from "@/layouts/subpage";

export default function DocsPage() {
  return (
    <SubPageLayout>
      <section className="flex flex-col items-center justify-center gap-2 py-2">
        <ContentList />
      </section>
    </SubPageLayout>
  );
}
