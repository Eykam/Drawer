import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "./ui/context-menu";

import Search from "./search";
import Controls from "./controls";
import GridView from "./file-grid-view";
import ListView from "./file-list-view";
import useFileSystem, { ViewModes } from "@/store/fileStore";
import DirectoryBreadcrumb from "./directory-breadcrumb";

const sampleFiles = [
  {
    fileName: "File Name One",
    size: 8.7,
    fileType: "Test One",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Two",
    size: 8.7,
    fileType: "Test Two",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Three",
    size: 8.7,
    fileType: "Test Three",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Four",
    size: 8.7,
    fileType: "Test Four",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Five",
    size: 8.7,
    fileType: "Test Five",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
  {
    fileName: "File Name Six",
    size: 8.7,
    fileType: "Test Six",
    date: "June 28, 2024",
  },
];

export default function FilesContainer() {
  const { viewMode } = useFileSystem();

  return (
    <main className="flex-1 p-6 space-y-4 pt-2 w-full h-full">
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="h-full relative">
            <div className="bg-background border-b flex items-center h-16 shrink-0 sticky top-0 left-0 z-10">
              <Search />
              <Controls />
            </div>

            <DirectoryBreadcrumb />

            <div className="max-h-[85%] overflow-y-auto">
              {viewMode === ViewModes.Grid ? (
                <GridView sampleFiles={sampleFiles} />
              ) : (
                <ListView />
              )}
            </div>
          </div>

          <ContextMenuContent>
            <ContextMenuItem>Create Folder</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuTrigger>
      </ContextMenu>
    </main>
  );
}
