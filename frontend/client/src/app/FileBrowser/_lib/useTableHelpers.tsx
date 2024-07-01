import useFileSystem from "@/store/fileStore";
import { useState } from "react";
import InfiniteList from "@/components/infinite-list";

const useTableHelpers = () => {
  const [nameAscending, setNameAscending] = useState(true);
  const [typeAscending, setTypeAscending] = useState(true);
  const [dateAscending, setDateAscending] = useState(true);
  const [sizeAscending, setSizeAscending] = useState(true);

  const {
    selected,
    rawFiles,
    handleCloseDeleteModal,
    setFiles,
    selectAll,
    handleFileClick,
    setSelectedContext,
  } = useFileSystem((state) => ({
    selected: state.selected,
    rawFiles: state.rawFiles,
    handleCloseDeleteModal: state.handleCloseDeleteModal,
    setFiles: state.setFiles,
    selectAll: state.selectAll,
    setSelectedContext: state.setSelectedContext,
    handleFileClick: state.handleFileClick,
  }));

  const sortByName = async () => {
    const rawTemp = rawFiles;

    nameAscending
      ? rawTemp.sort((a, b) => {
          if (a.mimeType === "dir" && b.mimeType !== "dir") {
            return -1;
          } else if (a.mimeType !== "dir" && b.mimeType === "dir") {
            return 1;
          } else {
            return b.name.localeCompare(a.name);
          }
        })
      : rawTemp.sort((a, b) => {
          if (a.mimeType === "dir" && b.mimeType !== "dir") {
            return -1;
          } else if (a.mimeType !== "dir" && b.mimeType === "dir") {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });

    setFiles(<InfiniteList FileList={rawTemp} selectAll={selectAll} />);
  };

  const formatDate = (date: string) => {
    const tempDate = date.split("T")[0].split("-");

    const fileDate = [tempDate[1], tempDate[2], tempDate[0]].join("/");
    const fileTime = date.split("T")[1].split(":").slice(0, 2).join(":");

    return fileDate + " " + fileTime;
  };

  const sortByDate = async () => {
    const rawTemp = rawFiles;

    dateAscending
      ? rawTemp.sort((a, b) => {
          if (a.mimeType === "dir" && b.mimeType !== "dir") {
            return -1;
          } else if (a.mimeType !== "dir" && b.mimeType === "dir") {
            return 1;
          } else if (a.mimeType === "dir" && b.mimeType === "dir") {
            return b.name.localeCompare(a.name);
          } else {
            const aDate = formatDate(a.lastModified).split(" ");
            const bDate = formatDate(b.lastModified).split(" ");

            if (aDate[0].localeCompare(bDate[0]) === 0) {
              return aDate[1].localeCompare(bDate[1]);
            }

            return aDate[0].localeCompare(bDate[0]);
          }
        })
      : rawTemp.sort((a, b) => {
          if (a.mimeType === "dir" && b.mimeType !== "dir") {
            return -1;
          } else if (a.mimeType !== "dir" && b.mimeType === "dir") {
            return 1;
          } else if (a.mimeType === "dir" && b.mimeType === "dir") {
            return a.name.localeCompare(b.name);
          } else {
            const aDate = formatDate(a.lastModified).split(" ");
            const bDate = formatDate(b.lastModified).split(" ");

            if (bDate[0].localeCompare(aDate[0]) === 0) {
              return bDate[1].localeCompare(aDate[1]);
            }

            return bDate[0].localeCompare(aDate[0]);
          }
        });

    setFiles(<InfiniteList FileList={rawTemp} selectAll={selectAll} />);
  };

  const getExt = (name: string) => {
    const tempName = name.split(".");
    return name.split(".")[tempName.length - 1];
  };

  const sortByType = async () => {
    const rawTemp = rawFiles;

    typeAscending
      ? rawTemp.sort((a, b) => {
          if (a.mimeType === "dir" && b.mimeType !== "dir") {
            return -1;
          } else if (a.mimeType !== "dir" && b.mimeType === "dir") {
            return 1;
          } else if (a.mimeType === "dir" && b.mimeType === "dir") {
            return b.name.localeCompare(a.name);
          } else {
            const aExt = getExt(a.name);
            const bExt = getExt(b.name);
            return bExt.localeCompare(aExt);
          }
        })
      : rawTemp.sort((a, b) => {
          if (a.mimeType === "dir" && b.mimeType !== "dir") {
            return -1;
          } else if (a.mimeType !== "dir" && b.mimeType === "dir") {
            return 1;
          } else if (a.mimeType === "dir" && b.mimeType === "dir") {
            return a.name.localeCompare(b.name);
          } else {
            const aExt = getExt(a.name);
            const bExt = getExt(b.name);
            return aExt.localeCompare(bExt);
          }
        });

    setFiles(<InfiniteList FileList={rawTemp} selectAll={selectAll} />);
  };

  const sortBySize = async () => {
    const rawTemp = rawFiles;

    sizeAscending
      ? rawTemp.sort((a, b) => {
          if (a.mimeType === "dir" && b.mimeType !== "dir") {
            return -1;
          } else if (a.mimeType !== "dir" && b.mimeType === "dir") {
            return 1;
          } else if (a.mimeType === "dir" && b.mimeType === "dir") {
            return b.name.localeCompare(a.name);
          } else {
            return b.size - a.size;
          }
        })
      : rawTemp.sort((a, b) => {
          if (a.mimeType === "dir" && b.mimeType !== "dir") {
            return -1;
          } else if (a.mimeType !== "dir" && b.mimeType === "dir") {
            return 1;
          } else if (a.mimeType === "dir" && b.mimeType === "dir") {
            return a.name.localeCompare(b.name);
          } else {
            return a.size - b.size;
          }
        });

    setFiles(<InfiniteList FileList={rawTemp} selectAll={selectAll} />);
  };

  const saveSelected = async () => {
    Array.from(selected).forEach((curr) => {
      if (curr.includes(".")) handleFileClick(curr);
    });

    selectAll(false);
  };

  const deleteSelected = async () => {
    handleCloseDeleteModal(true);
    setSelectedContext(Array.from(selected));
    selectAll(false);
  };

  return {
    nameAscending,
    typeAscending,
    dateAscending,
    sizeAscending,
    setNameAscending,
    setTypeAscending,
    setDateAscending,
    setSizeAscending,
    sortByName,
    sortByDate,
    sortByType,
    sortBySize,
    saveSelected,
    deleteSelected,
  };
};

export default useTableHelpers;
