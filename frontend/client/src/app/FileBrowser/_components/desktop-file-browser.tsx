import FilesContainer from "./files-container";
import Sidebar from "./sidebar";

export default function DesktopFileBrowser() {
  return (
    <div className="hidden lg:flex size-full">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <FilesContainer />
      </div>
    </div>
  );
}
