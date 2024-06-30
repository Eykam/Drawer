import useFileSystem from "@/store/fileStore";

const ContextMenuHelpers = () => {
  const {
    selectedContext,
    selected,
    rawFiles,
    handleFileClick,
    handleRename,
    handleCreateDir,
    handleDeleteObjects,
    handleDirClick,
    currentPath,
  } = useFileSystem();

  const getExt = (name: string) => {
    const tempName = name.split(".");
    return name.split(".")[tempName.length - 1];
  };

  const handleContextRename = async (action: string, dest: string) => {
    const filenames = rawFiles.map((curr) => curr.name);
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
        else handleRename(selectedContext[0], filename, "file");
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
          await handleRename(selectedContext[0], currDir + dest, "dir");
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
        await handleCreateDir(
          currentPath.length > 0
            ? currentPath.join("/") + "/" + dirname
            : dirname
        );
      }
    }
  };

  const handleContextDelete = async () => {
    handleDeleteObjects(selectedContext);
  };

  const handleContextSave = () => {
    selectedContext.forEach((context) => {
      if (context.includes(".")) handleFileClick(context);
    });
  };

  //   const handleContextCopy = () => {
  //     // if top menu => override with all rows
  //     // if context menu => override with single row
  //   };
  //   const handleContextPaste = () => {
  //     //if copy => paste into current dir, if currDir is same as Copy dir, rename with (Copy, ...etc)
  //   };

  return {
    // handleContextCopy: handleContextCopy,
    handleContextDelete: handleContextDelete,
    handleContextRename: handleContextRename,
    handleContextSave: handleContextSave,
  };
};

export default ContextMenuHelpers;
