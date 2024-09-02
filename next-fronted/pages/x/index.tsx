import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import TweetList from "@/components/feeds/xlist";

export default function DocsPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Twitter</h1>
        </div>
        <TweetList />
      </section>
    </DefaultLayout>
  );
}
