import React from "react";

import BlogList from "@/components/feeds/bloglist";
// import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function DocsPage() {
  React.useEffect(() => {
    localStorage.setItem("activeItem", "/nav/blog");
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-2 py-4 md:py-8">
        {/* <div className="inline-block max-w-lg text-center justify-center">
          <h5 className={title()}>Blog</h5>
        </div> */}
        <BlogList />
      </section>
    </DefaultLayout>
  );
}
