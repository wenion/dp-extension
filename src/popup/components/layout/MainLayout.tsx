import { Header } from "./Header";

import type { PropsWithChildren } from "react";

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="w-80 bg-white shadow-sm ring-1 ring-black/5">
      <Header />
      {children}
    </main>
  );
}
