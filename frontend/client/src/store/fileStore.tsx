import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum ViewModes {
  Grid,
  List,
}

const STORAGE_KEY = "drawer-view-mode";

interface FileUIState {
  // View mode
  viewMode: ViewModes;
  setViewMode: (viewMode: ViewModes) => void;
  toggleViewMode: () => void;

  // Selection state
  selected: Set<string>;
  addSelected: (selected: string[]) => void;
  removeSelected: (remove: string[]) => void;
  clearSelected: () => void;
  setSelected: (selected: Set<string>) => void;

  // Context for right-click actions
  selectedContext: string[];
  setSelectedContext: (selectedContext: string[]) => void;

  // Current path navigation
  currentPath: string[];
  setCurrentPath: (path: string[]) => void;

  // Modal states
  openDeleteModal: boolean;
  setOpenDeleteModal: (open: boolean) => void;
  openRename: boolean;
  setOpenRename: (open: boolean) => void;
  openModal: boolean;
  setOpenModal: (open: boolean) => void;

  // File viewer state
  selectedDocs: Blob[];
  setSelectedDocs: (docs: Blob[]) => void;
  currFilename: string;
  setCurrFilename: (filename: string) => void;

  // Context menu positions
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

  // File uploads
  fileUploads: FileList | null;
  setFileUploads: (files: FileList | null) => void;
}

const useFileStore = create<FileUIState>()(
  persist(
    (set) => ({
      // View mode
      viewMode: ViewModes.List,
      setViewMode: (viewMode) => set({ viewMode }),
      toggleViewMode: () =>
        set((state) => ({
          viewMode: state.viewMode === ViewModes.Grid ? ViewModes.List : ViewModes.Grid,
        })),

      // Selection state
      selected: new Set(),
      addSelected: (selected) =>
        set((state) => ({
          selected: new Set([...Array.from(state.selected), ...selected]),
        })),
      removeSelected: (remove) =>
        set((state) => ({
          selected: new Set(
            Array.from(state.selected).filter((filename) => !remove.includes(filename))
          ),
        })),
      clearSelected: () => set({ selected: new Set() }),
      setSelected: (selected) => set({ selected }),

      // Context for right-click actions
      selectedContext: [],
      setSelectedContext: (selectedContext) => set({ selectedContext }),

      // Current path navigation
      currentPath: [],
      setCurrentPath: (path) => set({ currentPath: path }),

      // Modal states
      openDeleteModal: false,
      setOpenDeleteModal: (open) => set({ openDeleteModal: open }),
      openRename: false,
      setOpenRename: (open) => set({ openRename: open }),
      openModal: false,
      setOpenModal: (open) => set({ openModal: open }),

      // File viewer state
      selectedDocs: [],
      setSelectedDocs: (docs) => set({ selectedDocs: docs }),
      currFilename: "",
      setCurrFilename: (filename) => set({ currFilename: filename }),

      // Context menu positions
      contextMenu: null,
      setContextMenu: (contextMenu) => set({ contextMenu }),
      contextMenuGen: null,
      setContextMenuGen: (contextMenuGen) => set({ contextMenuGen }),

      // File uploads
      fileUploads: null,
      setFileUploads: (files) => set({ fileUploads: files }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ viewMode: state.viewMode, currentPath: state.currentPath }),
    }
  )
);

export default useFileStore;
