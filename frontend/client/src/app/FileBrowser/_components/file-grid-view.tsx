import { FileInfo } from "@/types";
import FileCard from "./file-card";

type GridViewProps = {
  sampleFiles: FileInfo[];
};

export default function GridView({ sampleFiles }: GridViewProps) {
  return (
    <div className="relative max-h-[85%] overflow-y-scroll ">
      <div className="flex max-md:flex-col md:flex-wrap gap-6 items-center ">
        {sampleFiles.map((file, index) => (
          <FileCard {...file} key={index + file.name} className="z-10" />
        ))}
      </div>
    </div>
  );
}
