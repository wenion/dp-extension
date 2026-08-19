import { Allowlist } from "./pages/Allowlist";
import { Default } from "./pages/Default";

import { useAppContext } from "./context/context";

export default function App() {
  const {
    optionsPage,
  } = useAppContext();

  return (
    <main className="min-h-screen flex flex-col space-y-8 p-8">
      {optionsPage === "allowlist" ? (
        <Allowlist />
      ) : (
        <Default />
      )}
    </main>
  );
}
