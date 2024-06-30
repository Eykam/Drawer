import { cn } from "@/lib/utils";
import { NavItemProps } from "@/types";

export default function NavItem({ link, icon, name, className }: NavItemProps) {
  return (
    <a
      href={link}
      className={cn(
        "flex gap-2 text-muted-foreground hover:text-foreground justify-start items-center py-2 lg:py-0",
        className
      )}
    >
      <div className="border-2 rounded-sm border-black flex center">{icon}</div>
      {name}
    </a>
  );
}
