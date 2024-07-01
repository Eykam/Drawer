import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { FileInfo } from "@/types";
import { LucideIcon } from "lucide-react";

export default function ListView() {
  const files: FileInfo[] = [
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

  return (
    <div className="h-full border rounded-lg overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead className="hidden md:table-cell">File Type</TableHead>
            <TableHead className="hidden md:table-cell">File Size</TableHead>
            <TableHead className="hidden md:table-cell">
              Last Modified
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileIcon className="w-4 h-4 shrink-0" />
                  {file.name}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {file.type}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {file.size}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {file.date}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function FileIcon({
  className,
  ...props
}: {
  props?: LucideIcon;
  className: string;
}) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}
