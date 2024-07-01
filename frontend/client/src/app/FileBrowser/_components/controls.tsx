import useFileSystem, { ViewModes } from "@/store/fileStore";
import Icons from "@/components/Icons";
import { Button } from "@/components/ui/button";

export default function Controls() {
  const { setViewMode } = useFileSystem();

  return (
    <div className="ml-4 flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode(ViewModes.Grid)}
      >
        <Icons.LayoutGridIcon className="w-5 h-5" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode(ViewModes.List)}
      >
        <Icons.ListIcon className="w-5 h-5" />
        <span className="sr-only">List view</span>
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
