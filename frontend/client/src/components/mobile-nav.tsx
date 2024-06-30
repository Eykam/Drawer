import { navItems } from "@/config/nav";
import NavItem from "./ui/nav-item";
import Icons from "./Icons";

type MobileNavProps = {
  visible: boolean;
  toggleMenu: (visible: boolean) => void;
};

export default function MobileNav({ visible, toggleMenu }: MobileNavProps) {
  return (
    <div
      className={
        "fixed inset-0 top-[6%] z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80 md:hidden w-full"
      }
    >
      <div className="relative z-20 grid gap-6 bg-popover p-4 text-popover-foreground shadow-md border-2 border-black rounded-lg">
        <a
          href="#"
          onClick={() => toggleMenu(!visible)}
          className="flex space-x-2"
        >
          <Icons.MountainIcon className="h-6 w-6" />
          <span className="sr-only">Drawer</span>
          <div className="text-lg font-medium">Drawer</div>
        </a>
        <nav className="grid grid-flow-row auto-rows-max">
          {navItems.map((item) => (
            <div onClick={() => toggleMenu(!visible)} className="space-y-4">
              <NavItem {...item} key={item.name} />
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
