// import { title } from "@/components/primitives";
import React from "react";

import DefaultLayout from "@/layouts/default";
import ContentList from "@/components/feeds/detail_list";

export default function DocsPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <ContentList />
      </section>
    </DefaultLayout>
  );
}
