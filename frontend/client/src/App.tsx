import "@/styles/globals.css";
import { TailwindIndicator } from "./components/tailwind-indicator";
import Header from "@/components/header";
import Footer from "@/components/footer";
import FileBrowser from "@/app/FileBrowser/page";
import Login from "@/app/Login/page";

import { useCheckAuthenticated } from "./app/FileBrowser/_lib/user/useCheckAuthenticated";

function App() {
  const { status, data: authenticated } = useCheckAuthenticated({});

  if (status === "pending") return <></>;

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden">
      <Header />
      {authenticated ? <FileBrowser /> : <Login />}
      <Footer />

      <TailwindIndicator />
    </div>
  );
}

export default App;
