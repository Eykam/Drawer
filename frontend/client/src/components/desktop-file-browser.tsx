import FilesContainer from "./files-container";
import Sidebar from "./sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function DesktopFileBrowser() {
  return (
    <div className="hidden lg:block size-full">
      <ResizablePanelGroup direction="horizontal" className="min-h-[200px]">
        <ResizablePanel defaultSize={0.15}>
          <div className="flex h-full items-center justify-center p-6">
            <Sidebar />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={0.85}>
          <FilesContainer />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
