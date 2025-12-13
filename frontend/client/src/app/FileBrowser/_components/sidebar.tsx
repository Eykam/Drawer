import useFileStore, { SidebarFilter } from "@/store/fileStore";
import { ChevronLeft, ChevronRight, FolderOpen, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems: { id: SidebarFilter; name: string; icon: React.ReactNode }[] = [
  {
    id: "all",
    name: "All Files",
    icon: <FolderOpen className="w-5 h-5" />,
  },
  {
    id: "favorites",
    name: "Favorites",
    icon: <Star className="w-5 h-5" />,
  },
  {
    id: "recents",
    name: "Recents",
    icon: <Clock className="w-5 h-5" />,
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarFilter, setSidebarFilter } = useFileStore();

  return (
    <div className="relative h-full flex">
      <nav
        className={cn(
          "bg-muted/20 py-4 space-y-2 h-full transition-all duration-300 overflow-hidden",
          sidebarCollapsed ? "w-16 px-2" : "w-56 px-4"
        )}
      >
        {!sidebarCollapsed && (
          <div className="font-semibold text-sm mb-4">
            Browse
          </div>
        )}

        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSidebarFilter(item.id)}
            className={cn(
              "flex items-center gap-3 rounded-md transition-colors w-full text-left",
              sidebarCollapsed ? "justify-center p-2" : "px-3 py-2",
              sidebarFilter === item.id
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted/50"
            )}
            title={sidebarCollapsed ? item.name : undefined}
          >
            <div className="shrink-0">{item.icon}</div>
            {!sidebarCollapsed && (
              <span className="text-sm truncate">{item.name}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Collapse toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted z-10"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
