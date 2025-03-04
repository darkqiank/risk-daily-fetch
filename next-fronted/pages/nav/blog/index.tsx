import React from "react";

import BlogList from "@/components/feeds/bloglist";
// import { title } from "@/components/primitives";
import SubPageLayout from "@/layouts/subpage";

export default function DocsPage() {
  return (
    <SubPageLayout>
      <section className="flex flex-col items-center justify-center gap-2 py-2">
        <BlogList />
      </section>
    </SubPageLayout>
  );
}
