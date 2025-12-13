import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import FileBrowser from "@/app/FileBrowser/page";
import Login from "@/app/Login/page";
import Settings from "@/app/Settings/page";
import { useCheckAuthenticated } from "@/app/FileBrowser/_lib/user/useCheckAuthenticated";

// Root layout component
function RootLayout() {
  const { status, data: authenticated } = useCheckAuthenticated();

  if (status === "pending") return null;

  if (!authenticated) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col overflow-hidden">
        <Header />
        <Login />
        <Footer />
        <TailwindIndicator />
        <Toaster richColors position="bottom-right" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden">
      <Header />
      <Outlet />
      <Footer />
      <TailwindIndicator />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}

// Create root route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// File browser route (index)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: FileBrowser,
});

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

// Create route tree
const routeTree = rootRoute.addChildren([indexRoute, settingsRoute]);

// Create router
export const router = createRouter({ routeTree });

// Type declaration for router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
