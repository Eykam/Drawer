import { FileInfo } from "@/types";
import FileCard from "./file-card";

type GridViewProps = {
  sampleFiles: FileInfo[];
};

export default function GridView({ sampleFiles }: GridViewProps) {
  return (
    <div className="flex max-sm:flex-col md:flex-wrap gap-6 relative items-center overflow-y-auto">
      {sampleFiles.map((file, index) => (
        <FileCard {...file} key={index + file.fileName} className="z-10" />
      ))}
    </div>
  );
}
