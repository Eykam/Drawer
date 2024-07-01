import DesktopFileBrowser from "./desktop-file-browser";
import MobileFileBrowser from "./mobile-file-browser";

export default function FileBrowser() {
  return (
    <main className="h-[88%] overflow-y-auto">
      <MobileFileBrowser />
      <DesktopFileBrowser />
    </main>
  );
}
