import useFileStore from "@/store/fileStore";
import { useRenameFile } from "@/app/FileBrowser/_lib/filesystem/useRenameFile";
import { useCreateDirectory } from "@/app/FileBrowser/_lib/filesystem/useCreateDirectory";
import { useDeleteFiles } from "@/app/FileBrowser/_lib/filesystem/useDeleteFile";
import { useDownloadFile } from "@/app/FileBrowser/_lib/filesystem/useDownloadFiles";
import { useGetDirectory, type FileItem } from "@/app/FileBrowser/_lib/filesystem/useGetDirectory";

const useContextMenuHelpers = () => {
  const { selectedContext, currentPath } = useFileStore();

  const currentPathString =
    currentPath.length > 0 ? currentPath.join("/") + "/" : "";

  const { data: files = [] } = useGetDirectory(currentPathString);
  const renameMutation = useRenameFile();
  const createDirMutation = useCreateDirectory();
  const deleteMutation = useDeleteFiles();
  const downloadMutation = useDownloadFile();

  const getExt = (name: string) => {
    const tempName = name.split(".");
    return name.split(".")[tempName.length - 1];
  };

  const handleContextRename = async (action: string, dest: string) => {
    const filenames = files.map((curr: FileItem) => curr.name);
    console.log("filenames", filenames);

    if (action === "rename") {
      //If currently selected object is a file
      if (selectedContext[0].includes(".")) {
        const ext = "." + getExt(selectedContext[0]);

        const currPath = selectedContext[0].split("/");

        console.log("currPATH", currPath);
        const currDir =
          currPath.length > 1
            ? currPath.slice(0, currPath.length - 1).join("/") + "/"
            : currPath.slice(0, currPath.length - 1).join("/");

        let filename = "";

        if (!dest.includes(ext)) filename = currDir + dest + ext;
        else filename = currDir + ext;

        console.log("currDirRename:", currDir);
        console.log("currDest:", filename);

        if (filenames.includes(filename)) alert("File already Exists!");
        else renameMutation.mutate({ source: selectedContext[0], dest: filename, type: "file" });
      }

      //If currently selected object is a dir, and action is rename
      else {
        const currPath = selectedContext[0].split("/");
        const currDir =
          currPath.length > 0
            ? currPath.slice(0, currPath.length - 2).join("/") + "/"
            : currPath.slice(0, currPath.length - 2).join("/");

        if (filenames.includes(dest)) {
          alert("Folder already Exists!");
        } else {
          renameMutation.mutate({ source: selectedContext[0], dest: currDir + dest, type: "dir" });
        }
      }
    }

    //If action is createDir
    else {
      const dirname = dest.replaceAll("/", "") + "/";

      //If dir already exists, alert user
      if (filenames.includes(dirname)) {
        alert("Folder already Exists!");
      }
      //If dir doesnt exists, create it
      else {
        createDirMutation.mutate(
          currentPath.length > 0
            ? currentPath.join("/") + "/" + dirname
            : dirname
        );
      }
    }
  };

  const handleContextDelete = async () => {
    deleteMutation.mutate(selectedContext);
  };

  const handleContextSave = () => {
    selectedContext.forEach((context) => {
      if (context.includes(".")) downloadMutation.mutate(context);
    });
  };

  return {
    handleContextDelete,
    handleContextRename,
    handleContextSave,
  };
};

export default useContextMenuHelpers;
