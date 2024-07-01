import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, MenuItem, Menu } from "@mui/material";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import useFileSystem from "@/store/fileStore";
import InfiniteList from "@/components/infinite-list";
import { File as StoreFile } from "@/store/fileStore";
import ContextMenuHelpers from "@/lib/contextMenuHelpers";
import useTableHelpers from "@/app/FileBrowser/_lib/useTableHelpers";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { IconButton } from "@mui/material";
import Document from "./_components/document-viewer";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const FILES_URL = "/api/";
const FILES_UPLOAD = "/api/upload";

const Home = () => {
  const {
    files,
    dynamicPath,
    selectedDocs,
    currFilename,
    currentPath,
    fileUploads,
    openModal,
    contextMenu,
    rowSelected,
    openRename,
    openDeleteModal,
    selectedContext,
    contextMenuGen,
    rawFiles,
    setContextMenuGen,
    setContextMenu,
    setOpenModal,
    setFileUploads,
    setDynamicPath,
    setFiles,
    selectAll,
    setRawFiles,
    handleDirClick,
    handleCloseRename,
    handleCloseDeleteModal,
  } = useFileSystem((state) => ({ ...state, rowSelected: state.selected }));

  const helpers = ContextMenuHelpers();
  const tableHelpers = useTableHelpers();

  const [renameAction, setRenameAction] = useState("");
  const newName = useRef<HTMLInputElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDocument = useMemo(
    () => <Document selectedDocs={selectedDocs} filename={currFilename} />,
    [selectedDocs]
  );

  const handleContextMenuGen = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuGen(
      contextMenuGen === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const handleCloseGen = () => {
    setContextMenuGen(null);
  };

  const handleClose = () => {
    if (contextMenu?.event?.target as HTMLDivElement)
      (contextMenu?.event?.target as HTMLDivElement).style.background = "none";
    setContextMenu(null);
  };

  const logout = async () => {
    let logoutRes = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    // let logoutData = await logoutRes.json();
    // console.log("logoutData", logoutData);

    window.location.reload();
  };

  const getFiles = async (currPath: string) => {
    let bodyRes = await fetch(FILES_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: currPath }),
    });
    let bodyData = await bodyRes.json();
    console.log("data:", bodyData);
    return bodyData;
  };

  const back = () => {
    let desiredPath = currentPath.slice(0, currentPath.length - 1);

    if (desiredPath.length === 0) handleDirClick("");
    else {
      console.log("desiredPath", desiredPath.join("/"));
      handleDirClick(desiredPath.join("/") + "/");
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    handleDirClick(
      currentPath.length > 1
        ? currentPath.join("/") + "/"
        : currentPath.join("/")
    );
  };

  const handleUploadButton = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = fileInputRef.current?.files;

    if (files) setFileUploads(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const fileList = e.dataTransfer.files;

    // You can handle the dropped files here, for example, by uploading them.
    console.log("Dropped files:", fileList);

    // Update state or perform other actions based on the dropped files
    setFileUploads(fileList);

    // Reset background color and cursor style
    document.body.style.backgroundColor = "";
    document.body.style.cursor = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Set background color and cursor style
    // document.body.style.transition = "background-color 0.2s";
    document.body.style.backgroundColor = "rgb(140,140,140)";
    document.body.style.cursor = "copy";
  };

  //Creating dynamicDir as currentPath is updated
  useEffect(() => {
    const createDynamicDir = (path: string[]) => {
      let currDir = "";

      path = ["", ...path];
      let dynamicPath = path.map((subPath) => {
        if (subPath) currDir += subPath + "/";

        return (
          <button
            style={{
              background: "none",
              color: "blue",
              border: "none",
              padding: "0",
              font: "inherit",
              cursor: "pointer",
              outline: "inherit",
            }}
            id={currDir}
            onClick={(e) => {
              handleDirClick(e.currentTarget.id);
            }}
          >
            /{subPath ? subPath : "Home"}
          </button>
        );
      });

      console.log("dynamicpath:", dynamicPath);
      setDynamicPath(dynamicPath);
    };

    createDynamicDir(currentPath);
  }, [currentPath]);

  //Uploading Files
  useEffect(() => {
    const handleUpload = async () => {
      if (!fileUploads || fileUploads.length === 0) {
        alert("Please select at least one file.");
        return;
      }

      const formData = new FormData();
      let currPathString = currentPath.join("/") || "";
      console.log("currPath string", currPathString);
      formData.append("uploadPath", currPathString);

      const existingFilenames = rawFiles.map((curr) =>
        curr.name.slice(currPathString.length + 1, curr.name.length)
      );

      console.log("existing", existingFilenames);

      Array.from(fileUploads).forEach(async (file) => {
        let name = file.name;
        let counter = 1;

        const nameArr = file.name.split(".");

        while (existingFilenames.includes(name)) {
          name = nameArr[0] + `(${counter}).` + nameArr[1];
          counter++;
        }

        console.log("updatedName", name);
        if (name !== file.name) {
          const nFile = new File([file], name, {
            lastModified: file.lastModified,
            type: file.type,
          });

          console.log("newFile", nFile);
          formData.append("files", nFile);
        } else {
          formData.append("files", file);
        }
      });

      try {
        const response = await fetch(FILES_UPLOAD, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("File upload failed.");
        }

        setOpenModal(true);
      } catch (error) {
        console.error("Error uploading files:", error);
        alert("File upload failed.");
      }
    };

    if (fileUploads) {
      handleUpload();
    }
  }, [fileUploads]);

  //Intial loading of home directory
  useEffect(() => {
    let path = currentPath.join("");

    getFiles(path).then((data: StoreFile[]) => {
      const sorted = data.sort((a, b) => {
        if (a.mimeType === "dir" && b.mimeType !== "dir") {
          return -1;
        } else if (a.mimeType !== "dir" && b.mimeType === "dir") {
          return 1;
        } else {
          return a.name.localeCompare(b.name);
        }
      });

      const newBody = <InfiniteList FileList={sorted} selectAll={selectAll} />;
      setRawFiles(sorted as StoreFile[]);
      setFiles(newBody);
    });
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onContextMenu={handleContextMenuGen}
    >
      <Menu
        open={contextMenuGen !== null}
        onClose={handleCloseGen}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuGen !== null
            ? { top: contextMenuGen.mouseY, left: contextMenuGen.mouseX }
            : undefined
        }
      >
        {/* <MenuItem onClick={handleClose}>Copy</MenuItem> */}
        {/* <MenuItem onClick={handleCloseGen}>Paste</MenuItem> */}
        <MenuItem
          onClick={() => {
            if (!openRename) {
              setRenameAction("mkdir");
            }

            handleCloseRename(!openRename);
          }}
        >
          Create Folder
        </MenuItem>
      </Menu>

      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {/* <MenuItem onClick={handleClose}>Copy</MenuItem> */}
        <MenuItem onClick={helpers.handleContextSave}>Save</MenuItem>
        <MenuItem
          onClick={() => {
            if (!openRename) {
              setRenameAction("rename");
            }

            handleCloseRename(!openRename);
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseDeleteModal(!openDeleteModal);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Modal open={openModal} onClose={handleCloseModal}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "2%",
            borderRadius: "5px",
          }}
        >
          <h2 style={{ padding: "0", margin: "0" }}>
            Files Uploaded Successfully!
          </h2>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </div>
      </Modal>

      <Modal
        open={openRename}
        onClose={() => {
          renameAction === "rename" ? handleClose() : handleCloseGen();
          handleCloseRename(!openRename);
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "2%",
            borderRadius: "5px",
          }}
        >
          <h2 style={{ padding: "0", margin: "0" }}>New name:</h2>
          <div style={{ display: "flex" }}>
            <TextField inputRef={newName} label="name" variant="outlined" />
            <Button
              variant="contained"
              color="primary"
              style={{ fontWeight: "bolder" }}
              onClick={(e) => {
                console.log("curr", newName.current);
                helpers.handleContextRename(
                  renameAction,
                  newName.current?.value || ""
                );
              }}
            >
              Enter
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={openDeleteModal}
        onClose={() => {
          handleClose();
          handleCloseDeleteModal(!openDeleteModal);
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "2%",
            borderRadius: "5px",
          }}
        >
          <h2 style={{ padding: "0", margin: "0", marginBottom: "2%" }}>
            Confirm Deletion:
          </h2>

          <Paper
            style={{
              background: "rgb(200,200,200)",
              minHeight: "5vh",
              display: "flex",
              alignItems: "Center",
              margin: "0",
            }}
          >
            <span style={{ fontWeight: "bolder" }}>
              {selectedContext.map((context) => (
                <>
                  {context.includes(".")
                    ? context.split("/")[context.split("/").length - 1]
                    : context.split("/")[context.split("/").length - 2]}
                  <br />
                </>
              ))}
            </span>
          </Paper>

          <Button
            variant="contained"
            color="error"
            style={{ fontWeight: "bolder", marginTop: "2%" }}
            onClick={(e) => {
              helpers.handleContextDelete();
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>

      <div
        style={{
          width: window.innerWidth >= 1200 ? "80%" : "95%",
          height: "100%",
          margin: "auto",
          overflow: "hidden",
        }}
      >
        <h1
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <a href="/">🏠</a>
          </div>

          <Button
            variant="contained"
            onClick={logout}
            style={{ fontWeight: "bolder" }}
          >
            {" "}
            Logout
          </Button>
        </h1>

        <h1>Remote Disk (C:)</h1>

        {window.innerWidth >= 1200 ? (
          <Paper
            style={{
              width: "98%",
              height: window.innerWidth < 1400 ? "70%" : "75%",
              padding: "1%",
              background: "rgb(220,220,220)",
            }}
          >
            <h2
              style={{
                padding: 0,
                margin: 0,
                display: "flex",
                width: "49%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0",
                    font: "inherit",
                    cursor: "pointer",
                    outline: "inherit",
                    marginRight: "2%",
                  }}
                  onClick={back}
                >
                  🔙
                </button>
                {dynamicPath}
              </div>
            </h2>

            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ width: "49%", marginTop: "0", marginBottom: "0" }}>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    alignContent: "center",
                  }}
                >
                  <div
                    style={{
                      justifySelf: "start",
                      visibility: "visible",
                      width: "95%",
                      display: "flex",
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      hidden
                      onChange={handleUploadButton}
                    />
                    <IconButton onClick={() => fileInputRef.current?.click()}>
                      <FileUploadIcon style={{ padding: "0", margin: "0" }} />
                    </IconButton>

                    <div
                      style={{
                        visibility: rowSelected.size > 0 ? "visible" : "hidden",
                      }}
                    >
                      <IconButton onClick={tableHelpers.saveSelected}>
                        <DownloadIcon color="success" />
                      </IconButton>
                    </div>
                  </div>

                  <div
                    style={{
                      visibility: rowSelected.size > 0 ? "visible" : "hidden",
                      // justifyContent: "end",
                    }}
                  >
                    <div style={{ width: "5%" }}>
                      <IconButton onClick={tableHelpers.deleteSelected}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </div>
                  </div>
                </div>
                {files}
              </h3>

              {currentDocument}
            </div>
          </Paper>
        ) : (
          <Paper
            style={{
              width: "100%",
              height: "auto",
              minHeight: "75%",
              boxShadow: "none",
              overflowY: "scroll",
              overflowX: "hidden",
              padding: "0",
              margin: "0",
            }}
          >
            <h2
              style={{
                padding: 0,
                margin: 0,
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0",
                    font: "inherit",
                    cursor: "pointer",
                    outline: "inherit",
                    marginRight: "2%",
                  }}
                  onClick={back}
                >
                  🔙
                </button>
                {dynamicPath}
              </div>
            </h2>

            <div
              style={{
                width: "100%",
                height: "auto",
                overflowY: "scroll",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {currentDocument}
              </div>

              <h3
                style={{
                  width: "100%",
                  height: "auto",
                  marginTop: "0",
                  marginBottom: "0",
                  overflowY: "scroll",
                }}
              >
                <div
                  style={{
                    width: "5%",
                    display: "inline-flex",
                    justifySelf: "start",
                    alignContent: "center",
                    visibility: "visible",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={handleUploadButton}
                  />
                  <IconButton onClick={() => fileInputRef.current?.click()}>
                    <FileUploadIcon style={{ padding: "0", margin: "0" }} />
                  </IconButton>

                  <IconButton onClick={tableHelpers.saveSelected}>
                    <DownloadIcon color="success" />
                  </IconButton>
                </div>

                <div
                  style={{
                    width: "95%",
                    display: "inline-flex",
                    visibility: rowSelected.size > 0 ? "visible" : "hidden",
                    justifyContent: "end",
                    alignContent: "center",
                  }}
                >
                  <div style={{ width: "auto" }}>
                    <IconButton onClick={tableHelpers.deleteSelected}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </div>
                </div>
                {files}
              </h3>
            </div>
          </Paper>
        )}
      </div>
    </div>
  );
};

export default Home;
