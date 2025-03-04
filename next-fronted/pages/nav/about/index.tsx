import React from "react";

import { title } from "@/components/primitives";
import SubPageLayout from "@/layouts/subpage";

export default function DocsPage() {
  return (
    <SubPageLayout pageTitle="关于">
      <section className="flex flex-col items-center justify-center gap-4 py-2">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>About</h1>
        </div>
      </section>
    </SubPageLayout>
  );
}
