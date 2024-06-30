import { useEffect } from "react";
import "@/styles/globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import useUserStore from "./store/userStore";
import FileBrowser from "./components/file-browser";
import { TailwindIndicator } from "./components/tailwind-indicator";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
  const { loggedIn, checkAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden">
      <Header />
      {/* {loggedIn ? <FileBrowser /> : <Login />} */}
      {loggedIn ? <Home /> : <Login />}

      <Footer />
      <TailwindIndicator />
    </div>
  );
}

export default App;
