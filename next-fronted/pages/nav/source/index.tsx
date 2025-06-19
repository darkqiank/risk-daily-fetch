import React from "react";

import SubPageLayout from "@/layouts/subpage";
import SourceTable from "@/components/ui/source";

export default function DocsPage() {
    return (
      <SubPageLayout>
        <section className="flex flex-col items-center justify-center gap-2 py-2">
            <div>
                <h1>数据源管理</h1>
                <SourceTable />
            </div>
        </section>
      </SubPageLayout>
    );
  }