import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

import Controls from "./controls";
import GridView from "./file-grid-view";
import ListView from "./ListView/page";
import useFileStore, { ViewModes } from "@/store/fileStore";
import DirectoryBreadcrumb from "./directory-breadcrumb";
import Search from "./search";
import FileViewerModal from "./file-viewer-modal";

export default function FilesContainer() {
  const { viewMode } = useFileStore();

  return (
    <div className="flex-1 flex flex-col p-6 pt-2 w-full h-full min-h-0 overflow-hidden">
      <ContextMenu>
        <ContextMenuTrigger className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-background border-b flex items-center h-16 shrink-0 sticky top-0 left-0 z-10">
              <Search />
              <Controls />
            </div>

            <DirectoryBreadcrumb />

            <div className="flex-1 flex flex-col min-h-0">
              {viewMode === ViewModes.Grid ? <GridView /> : <ListView />}
            </div>
          </div>

          <ContextMenuContent>
            <ContextMenuItem>Create Folder</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuTrigger>
      </ContextMenu>

      <FileViewerModal />
    </div>
  );
}
