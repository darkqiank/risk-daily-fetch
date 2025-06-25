import React from "react";

import SubPageLayout from "@/layouts/subpage";
import WorkflowList from "@/components/feeds/workflow_list";

export default function DocsPage() {
    return (
      <SubPageLayout>
        <section className="flex flex-col items-center justify-center gap-2 py-2">
            <div>
                <h1>工作流管理</h1>
            </div>
            <WorkflowList />
        </section>
      </SubPageLayout>
    );
  }