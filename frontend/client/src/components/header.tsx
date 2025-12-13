import Icons from "./Icons";
import { Button } from "./ui/button";
import MobileNav from "./mobile-nav";
import { useState } from "react";
import { useLogout } from "@/app/FileBrowser/_lib/user/useLogout";
import { Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";
import useFileStore from "@/store/fileStore";

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const logout = useLogout().mutate;
  const setCurrentPath = useFileStore((state) => state.setCurrentPath);

  const handleHomeClick = () => {
    setCurrentPath([]);
  };

  return (
    <header className="bg-background border-b flex items-center justify-between px-4 h-[7%] shrink-0">
      <div className="flex items-center gap-4">
        <Link to="/" className="hidden lg:flex space-x-2 items-center hover:opacity-80 transition-opacity" onClick={handleHomeClick}>
          <Icons.MountainIcon className="h-6 w-6" />
          <span className="sr-only">Drawer</span>
          <div className="text-lg font-medium hidden lg:block">Drawer</div>
        </Link>

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

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/settings">
            <Settings className="w-5 h-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => logout()}>
          <Icons.LogOutIcon className="w-5 h-5 text-red-500" />
          <span className="sr-only">Log Out</span>
        </Button>
      </div>
    </header>
  );
}
