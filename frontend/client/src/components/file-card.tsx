import { HTMLAttributes } from "react";
import Icons from "./Icons";
import { Button } from "./ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

type FileCardProps = HTMLAttributes<HTMLDivElement> & {
  fileName: string;
  size: number;
  fileType: string;
  date: string;
  imgSrc?: string;
};

export default function FileCard({
  fileName,
  size,
  fileType,
  date,
  imgSrc,
}: FileCardProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="bg-background rounded-md shadow-sm overflow-hidden group w-full h-full max-w-[330px] cursor-pointer border-primary/40 border">
        <a href="#" className="block relative">
          <img
            src={imgSrc || "/placeholder.svg"}
            alt={"File thumbnail -" + fileName}
            width={300}
            height={200}
            className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="text-white">
              <Icons.DownloadIcon className="w-5 h-5" />
              <span className="sr-only">Download</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Icons.ShareIcon className="w-5 h-5" />
              <span className="sr-only">Share</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Icons.TrashIcon className="w-5 h-5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </a>
        <div className="p-4 space-y-2 text-muted-foreground text-sm">
          <div className="flex items-center justify-between">
            <p className="text-primary font-semibold">{fileName}</p>
            <p className="text-primary font-semibold">{size} MB</p>
          </div>
          <div className="flex items-center justify-between">
            <p>{fileType}</p>
            <p>{date}</p>
          </div>
        </div>

        <ContextMenuContent className="w-48">
          <ContextMenuItem>Open</ContextMenuItem>
          <ContextMenuItem>Save</ContextMenuItem>
          <ContextMenuItem>Rename</ContextMenuItem>
          <ContextMenuItem>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
