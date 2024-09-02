import { Link } from "@nextui-org/link";

import { Head } from "./head";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Head />
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-2 md:pt-4">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://catflix.cn"
          title="catflix.cn homepage"
        >
          <span className="text-default-600">Powered by</span>
          <p className="text-primary">CATFLIX</p>
        </Link>
      </footer>
    </div>
  );
}
