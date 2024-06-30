import NavItem from "./ui/nav-item";
import { navItems } from "@/config/nav";

export default function Sidebar() {
  return (
    <nav className="bg-muted/20 p-4 space-y-4 size-full text-md">
      <div className="font-semibold">File Categories</div>
      {navItems.map((item) => (
        <NavItem {...item} key={item.name} />
      ))}
    </nav>
  );
}
