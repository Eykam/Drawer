import DesktopFileBrowser from "./desktop-file-browser";
import MobileFileBrowser from "./mobile-file-browser";

export default function FileBrowser() {
  return (
    <div className="h-[88%] overflow-y-auto">
      <MobileFileBrowser />
      <DesktopFileBrowser />
    </div>
  );
}
