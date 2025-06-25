import React from "react";

import SubPageLayout from "@/layouts/subpage";
import FlowRuns from "@/components/feeds/flow_runs";

export default function DocsPage() {
    return (
      <SubPageLayout>
        <section className="flex flex-col items-center justify-center gap-2 py-2">
            <div>
                <h1>运行记录</h1>
            </div>
            <FlowRuns />
        </section>
      </SubPageLayout>
    );
  }