import Icons from "./Icons";
import { Button } from "./ui/button";
import MobileNav from "./mobile-nav";
import { useState } from "react";
import { useLogout } from "@/app/FileBrowser/_lib/user/useLogout";

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const logout = useLogout().mutate;

  return (
    <header className="bg-background border-b flex items-center justify-between px-4 h-[7%] shrink-0">
      <div className="flex items-center gap-4">
        <a href="#" className="hidden lg:flex space-x-2">
          <Icons.MountainIcon className="h-6 w-6" />
          <span className="sr-only">Drawer</span>
          <div className="text-lg font-medium hidden lg:block">Drawer</div>
        </a>

        <button
          className="flex items-center space-x-2 lg:hidden"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <Icons.CloseIcon /> : <Icons.MountainIcon />}
          <span className="font-bold">Menu</span>
        </button>

        {showMobileMenu && (
          <MobileNav toggleMenu={setShowMobileMenu} visible={showMobileMenu} />
        )}
      </div>

      <Button variant="ghost" size="icon" onClick={() => logout()}>
        <Icons.LogOutIcon className="w-5 h-5 text-red-500" />
        <span className="sr-only">Log Out</span>
      </Button>
    </header>
  );
}
