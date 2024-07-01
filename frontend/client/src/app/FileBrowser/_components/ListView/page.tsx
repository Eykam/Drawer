import { useMemo } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { FileInfo } from "@/types";

function getData(): FileInfo[] {
  // Fetch data from your API here.
  return [
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
}

export default function ListView() {
  const data = useMemo(() => getData(), []);

  return (
    <div className="container p-0 lg:mx-auto h-fit w-full max-w-full ">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
