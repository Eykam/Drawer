import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

import Controls from "./controls";
import GridView from "./file-grid-view";
import ListView from "./ListView/page";
import useFileSystem, { ViewModes } from "@/store/fileStore";
import DirectoryBreadcrumb from "./directory-breadcrumb";
import Search from "./search";
import { FileInfo } from "@/types";

const sampleFiles: FileInfo[] = [
  {
    name: "Document.docx",
    type: "Document",
    size: 120,
    date: "2023-06-15",
  },
  {
    name: "Presentation.pptx",
    type: "Presentation",
    size: 3.2,
    date: "2023-05-30",
  },
  {
    name: "Image.jpg",
    type: "Image",
    size: 2.1,
    date: "2023-04-20",
  },
  {
    name: "Spreadsheet.xlsx",
    type: "Spreadsheet",
    size: 500,
    date: "2023-06-01",
  },
  {
    name: "PDF.pdf",
    type: "PDF",
    size: 1.5,
    date: "2023-03-10",
  },
  {
    name: "Video.mp4",
    type: "Video",
    size: 25,
    date: "2023-02-28",
  },
  {
    name: "Audio.mp3",
    type: "Audio",
    size: 8,
    date: "2023-01-15",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
  {
    name: "Archive.zip",
    type: "Archive",
    size: 4.2,
    date: "2023-06-05",
  },
];

export default function FilesContainer() {
  const { viewMode } = useFileSystem();

  return (
    <div className="flex-1 p-6 space-y-4 pt-2 w-full h-full">
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="h-full relative">
            <div className="bg-background border-b flex items-center h-16 shrink-0 sticky top-0 left-0 z-10">
              <Search />
              <Controls />
            </div>

            <DirectoryBreadcrumb />

            {viewMode === ViewModes.Grid ? (
              <GridView sampleFiles={sampleFiles} />
            ) : (
              <ListView />
            )}
          </div>

          <ContextMenuContent>
            <ContextMenuItem>Create Folder</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuTrigger>
      </ContextMenu>
    </div>
  );
}
