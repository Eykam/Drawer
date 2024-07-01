import { create } from "zustand";
import InfiniteList from "../components/infinite-list";

const FILES_URL = "/api/";

export interface File {
  name: string;
  mimeType: string;
  lastModified: string;
  size: number;
}

export enum ViewModes {
  Grid,
  List,
}

interface BearState {
  viewMode: ViewModes;
  setViewMode: (viewMode: ViewModes) => void;
  openDeleteModal: boolean;
  handleCloseDeleteModal: (open: boolean) => void;
  openRename: boolean;
  handleCloseRename: (open: boolean) => void;
  selected: Set<string>;
  addSelected: (selected: string[]) => void;
  removeSelected: (remove: string[]) => void;
  selectAll: (add: boolean) => void;
  selectedContext: string[];
  setSelectedContext: (selectedContext: string[]) => void;
  rawFiles: File[];
  setRawFiles: (files: File[]) => void;
  files: null | JSX.Element;
  setFiles: (files: JSX.Element) => void;
  currentPath: string[];
  setCurrentPath: (path: string[]) => void;
  dynamicPath: JSX.Element[];
  setDynamicPath: (path: JSX.Element[]) => void;
  fileUploads: FileList | null;
  setFileUploads: (files: FileList) => void;
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  selectedDocs: Blob[];
  setSelectedDocs: (docs: Blob[]) => void;
  currFilename: string;
  setCurrFilename: (filename: string) => void;
  contextMenu: {
    mouseX: number;
    mouseY: number;
    event: React.MouseEvent<Element, MouseEvent>;
  } | null;
  setContextMenu: (
    contextMenu: {
      mouseX: number;
      mouseY: number;
      event: React.MouseEvent<Element, MouseEvent>;
    } | null
  ) => void;
  contextMenuGen: {
    mouseX: number;
    mouseY: number;
  } | null;
  setContextMenuGen: (
    contextMenuGen: {
      mouseX: number;
      mouseY: number;
    } | null
  ) => void;
  handleRename: (source: string, dest: string, type: string) => void;
  handleFileClick: (currPath: string) => void;
  handleViewFile: (currPath: string) => void;
  handleDirClick: (currPath: string) => void;
  handleContextMenu: (event: React.MouseEvent) => void;
  handleCreateDir: (name: string) => void;
  handleDeleteObjects: (objects: string[]) => void;
}

const useFileSystem = create<BearState>((set, get) => ({
  viewMode: ViewModes.List,
  setViewMode: (viewMode: ViewModes) => set({ viewMode }),
  selected: new Set(),
  addSelected: (selected) =>
    set((state) => ({
      selected: new Set<string>([...Array.from(state.selected), ...selected]),
    })),
  removeSelected: (remove) =>
    set((state) => ({
      selected: new Set<string>(
        Array.from(state.selected).filter(
          (filename) => !remove.includes(filename)
        )
      ),
    })),
  selectAll: (add) => {
    console.log("selectAll", add);
    if (add) {
      set((state) => ({
        selected: new Set<string>(
          state.rawFiles.map((currFile) => {
            console.log("currFile", currFile.name);
            return currFile.name;
          })
        ),
      }));
    } else {
      set({
        selected: new Set(),
      });
    }
  },

  selectedContext: [],
  setSelectedContext: (selectedContext) =>
    set({ selectedContext: selectedContext }),

  openDeleteModal: false,
  handleCloseDeleteModal: (open) => set({ openDeleteModal: open }),

  openRename: false,
  handleCloseRename: (open) => set({ openRename: open }),

  rawFiles: [],
  setRawFiles: (files) => set({ rawFiles: files }),

  files: null,
  setFiles: (files) => set({ files: files }),

  currentPath: [],
  setCurrentPath: (path) => set({ currentPath: path }),

  dynamicPath: [],
  setDynamicPath: (path) => set({ dynamicPath: path }),

  fileUploads: null,
  setFileUploads: (files) => set({ fileUploads: files }),

  openModal: false,
  setOpenModal: (open) => set({ openModal: open }),

  selectedDocs: [],
  setSelectedDocs: (docs) => set({ selectedDocs: docs }),

  currFilename: "",
  setCurrFilename: (filename) => set({ currFilename: filename }),

  contextMenu: null,
  setContextMenu: (
    contextMenu: {
      mouseX: number;
      mouseY: number;
      event: React.MouseEvent<Element, MouseEvent>;
    } | null
  ) => set({ contextMenu: contextMenu }),
  contextMenuGen: null,
  setContextMenuGen: (
    contextMenuGen: {
      mouseX: number;
      mouseY: number;
    } | null
  ) => set({ contextMenuGen: contextMenuGen }),

  handleFileClick: async (currPath) => {
    const bodyRes = await fetch(FILES_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: currPath }),
    });

    const currFile = await bodyRes.blob();
    const currFileUrl = URL.createObjectURL(currFile);

    const splitPath = currPath.split("/");
    const relativePath = splitPath[splitPath.length - 1];
    const link = document.createElement("a");
    link.href = currFileUrl;
    link.download = relativePath;
    link.click();
  },

  handleViewFile: async (currPath) => {
    const bodyRes = await fetch(FILES_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: currPath }),
    });

    const currFile = await bodyRes.blob();
    // const currFileUrl = URL.createObjectURL(currFile);

    console.log("currFile:", currFile);

    const splitPath = currPath.split("/");
    const relativePath = splitPath[splitPath.length - 1];

    set({ selectedDocs: [currFile], currFilename: relativePath });
  },

  handleDirClick: async (currPath) => {
    console.log("currpath fetch", currPath);
    const bodyRes = await fetch(FILES_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: currPath }),
    });

    const bodyData = await bodyRes.json();

    const sorted = (bodyData as File[]).sort((a, b) => {
      if (a.mimeType === "dir" && b.mimeType !== "dir") {
        return -1;
      } else if (a.mimeType !== "dir" && b.mimeType === "dir") {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    console.log("new data", sorted);

    set((state) => ({
      files: <InfiniteList FileList={sorted} selectAll={state.selectAll} />,
      rawFiles: sorted,
      currentPath: currPath.split("/").filter((subpath) => subpath !== ""),
    }));
  },

  handleRename: async (source, dest, type) => {
    console.log(`source ${source} dest ${dest}`);
    const bodyRes = await fetch(FILES_URL + "rename", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: source, dest: dest, type: type }),
    });

    set({
      contextMenu: null,
      openRename: false,
    });

    const currPathArr = get().currentPath;
    console.log("rename path", currPathArr);
    const currPath =
      currPathArr.length > 0
        ? currPathArr.join("/") + "/"
        : currPathArr.join("/");

    get().handleDirClick(currPath);
    return bodyRes.status === 200;
  },

  handleCreateDir: async (name) => {
    const bodyRes = await fetch(FILES_URL + "mkdir", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name }),
    });

    console.log("mkdir status", bodyRes.status);

    set({
      contextMenuGen: null,
      openRename: false,
    });

    const currPathArr = get().currentPath;
    console.log("createDir path", currPathArr);
    const currPath =
      currPathArr.length > 0
        ? currPathArr.join("/") + "/"
        : currPathArr.join("/");

    get().handleDirClick(currPath);
    return bodyRes.status === 200;
  },

  handleContextMenu: (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("event");

    set((state) => ({
      contextMenu:
        state.contextMenu === null
          ? {
              mouseX: event.clientX + 2,
              mouseY: event.clientY - 6,
              event: event,
            }
          : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
            // Other native context menus might behave different.
            // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
            null,
    }));
  },

  handleDeleteObjects: async (objects: string[]) => {
    const bodyRes = await fetch(FILES_URL + "delete", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names: objects }),
    });

    console.log("delete status", bodyRes.status);

    set({
      contextMenu: null,
      openDeleteModal: false,
    });

    const currPathArr = get().currentPath;
    console.log("delete path", currPathArr);
    const currPath =
      currPathArr.length > 0
        ? currPathArr.join("/") + "/"
        : currPathArr.join("/");

    get().setContextMenu(null);
    get().handleDirClick(currPath);
    return bodyRes.status === 200;
  },
}));

export default useFileSystem;
