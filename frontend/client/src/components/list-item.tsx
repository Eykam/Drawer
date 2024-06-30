import { useMemo } from "react";
import { Checkbox, Tooltip } from "@mui/material";
import useFileSystem from "@/store/fileStore";
import { File } from "@/store/fileStore";

const ListItem = ({
  data,
  index,
}: {
  data: { files: File[] };
  index: number;
}) => {
  const {
    selected,
    handleContextMenu,
    handleViewFile,
    handleDirClick,
    addSelected,
    removeSelected,
    setSelectedContext,
  } = useFileSystem((state) => ({
    selected: state.selected,
    handleContextMenu: state.handleContextMenu,
    handleViewFile: state.handleViewFile,
    handleDirClick: state.handleDirClick,
    addSelected: state.addSelected,
    removeSelected: state.removeSelected,
    setSelectedContext: state.setSelectedContext,
  }));

  const curr = useMemo(() => {
    return data["files"][index];
  }, [data, index]);

  const getExt = (name: string) => {
    const tempName = name.split(".");
    return name.split(".")[tempName.length - 1];
  };

  const formatDate = (date: string) => {
    const tempDate = date.split("T")[0].split("-");

    const fileDate = [tempDate[1], tempDate[2], tempDate[0]].join("/");
    const fileTime = date.split("T")[1].split(":").slice(0, 2).join(":");

    return fileDate + " " + fileTime;
  };

  const createBody = (currFile: File) => {
    const currPath = currFile.name;

    if (currFile.mimeType === "dir") {
      const relativePathArr = currPath.split("/");
      const relativePath = relativePathArr[relativePathArr.length - 2];

      return (
        <div
          id={curr.name + "-menu"}
          style={{ width: "95%", display: "inline-block", cursor: "pointer" }}
          onClick={(e) => {
            e.preventDefault();
            handleDirClick(currFile.name);
          }}
          onContextMenu={(e) => {
            const curr = e.currentTarget as HTMLDivElement;

            curr.style.background = "rgb(175,175,175)";
            handleContextMenu(e);
            setSelectedContext([currPath]);
          }}
        >
          📁 {relativePath}
        </div>
      );
    }

    const relativePathArr = currPath.split("/");
    const relativePath = relativePathArr[relativePathArr.length - 1];

    return (
      <div
        id={curr.name + "-menu"}
        style={{
          width: "98%",
          display: "inline-block",
          cursor: "pointer",
        }}
        onClick={(e) => {
          // handleFileClick(file.name);
          e.preventDefault();
          handleViewFile(currFile.name);
        }}
        onContextMenu={(e) => {
          const curr = e.currentTarget as HTMLDivElement;

          curr.style.background = "rgb(175,175,175)";
          handleContextMenu(e);
          setSelectedContext([currPath]);
        }}
      >
        <Tooltip title={relativePath} enterDelay={1500} placement="right-start">
          <span
            style={{
              width: window.innerWidth >= 1200 ? "45%" : "80%",
              display: "inline-block",
              overflow: "clip",
              textOverflow: "ellipsis",
            }}
          >
            📄{" "}
            {relativePath.length <= (window.innerWidth >= 1200 ? 10 : 20)
              ? relativePath
              : relativePath.slice(0, window.innerWidth >= 1200 ? 10 : 20) +
                "..."}
          </span>
        </Tooltip>

        {window.innerWidth >= 1200 ? (
          <>
            <Tooltip
              title={formatDate(curr.lastModified)}
              enterDelay={1500}
              placement="left-start"
            >
              <span
                style={{
                  fontSize: "60%",
                  fontWeight: "bold",
                  width: "22%",
                  display: "inline-block",
                  color: "rgb(100,100,100)",
                  textOverflow: "ellipsis",
                  overflow: "clip",
                  margin: "0",
                  padding: "0",
                }}
              >
                {formatDate(curr.lastModified)}
              </span>
            </Tooltip>
            <Tooltip
              title={getExt(relativePath)}
              enterDelay={1500}
              placement="left-start"
            >
              <span
                style={{
                  fontSize: "60%",
                  fontWeight: "bold",
                  width: "20%",
                  display: "inline-block",
                  color: "rgb(100,100,100)",
                  textOverflow: "ellipsis",
                  overflow: "clip",
                }}
              >
                {getExt(relativePath).slice(0, 7)}
              </span>
            </Tooltip>
            <Tooltip
              title={(curr.size / 1000000).toFixed(2) + "MB"}
              enterDelay={1500}
              placement="left-start"
            >
              <span
                style={{
                  fontSize: "60%",
                  fontWeight: "bold",
                  width: "8%",
                  display: "inline-block",
                  color: "rgb(100,100,100)",
                  textOverflow: "ellipsis",
                  overflow: "clip",
                }}
              >
                {(curr.size / 1000000).toFixed(2)}MB
              </span>
            </Tooltip>{" "}
          </>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        borderRadius: "5px",
      }}
      onMouseOver={(e) => {
        let curr = e.currentTarget as HTMLDivElement;
        curr.style.background = "rgb(175,175,175)";
      }}
      onMouseLeave={(e) => {
        let curr = e.currentTarget as HTMLDivElement;
        curr.style.background = " rgb(220,220,220)";
      }}
    >
      <Checkbox
        size="small"
        style={{
          margin: "0",
          padding: "0",
          display: "flex",
          width: "5%",
        }}
        id={curr.name}
        name={curr.name}
        defaultChecked={false}
        checked={selected.has(curr.name)}
        onClick={(e) => {
          e.preventDefault();

          const id = (e.target as HTMLInputElement).id;
          if (selected.has(id)) removeSelected([id]);
          else addSelected([id]);
        }}
      />
      {createBody(curr)}
    </div>
  );
};

export default ListItem;
