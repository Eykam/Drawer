import useFileStore, { ViewModes } from "@/store/fileStore";
import Icons from "@/components/Icons";
import { Button } from "@/components/ui/button";

export default function Controls() {
  const { viewMode, toggleViewMode } = useFileStore();

  return (
    <div className="ml-4 flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleViewMode}
        title={viewMode === ViewModes.Grid ? "Switch to list view" : "Switch to grid view"}
      >
        {viewMode === ViewModes.Grid ? (
          <Icons.ListIcon className="w-5 h-5" />
        ) : (
          <Icons.LayoutGridIcon className="w-5 h-5" />
        )}
        <span className="sr-only">Toggle view</span>
      </Button>
      <Button variant="ghost" size="icon">
        <Icons.ListOrderedIcon className="w-5 h-5" />
        <span className="sr-only">Sort</span>
      </Button>
      <Button variant="ghost" size="icon">
        <Icons.FilterIcon className="w-5 h-5" />
        <span className="sr-only">Filter</span>
      </Button>
    </div>
  );
}
