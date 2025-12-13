import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import useFileStore from "@/store/fileStore";
import { Home, Star, Clock } from "lucide-react";

export default function DirectoryBreadcrumb() {
  const { currentPath, setCurrentPath, sidebarFilter, setSidebarFilter } = useFileStore();

  const handleNavigate = (index: number) => {
    // index -1 means go to root
    if (index === -1) {
      setCurrentPath([]);
    } else {
      // Navigate to path up to and including this index
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  // Show special breadcrumb for favorites/recents
  if (sidebarFilter === "favorites") {
    return (
      <div className="py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                Favorites
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  }

  if (sidebarFilter === "recents") {
    return (
      <div className="py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Recents
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  }

  return (
    <div className="py-4">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Home/Root */}
          <BreadcrumbItem>
            {currentPath.length === 0 ? (
              <BreadcrumbPage className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate(-1);
                }}
                className="flex items-center gap-1 cursor-pointer"
              >
                <Home className="h-4 w-4" />
                Home
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {/* Path segments */}
          {currentPath.map((segment, index) => (
            <span key={index} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === currentPath.length - 1 ? (
                  // Last segment is current page (not clickable)
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                ) : (
                  // Other segments are navigable
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate(index);
                    }}
                    className="cursor-pointer"
                  >
                    {segment}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
