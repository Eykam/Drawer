import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil } from "lucide-react";
import useFileStore from "@/store/fileStore";
import { useRenameFile } from "@/app/FileBrowser/_lib/filesystem/useRenameFile";
import { toast } from "sonner";

const CONFIRM_PHRASE = "rename";

export default function RenameConfirmModal() {
  const { openRename, setOpenRename, selectedContext, setSelectedContext } = useFileStore();
  const renameMutation = useRenameFile();
  const [newName, setNewName] = useState("");
  const [confirmInput, setConfirmInput] = useState("");

  const currentPath = selectedContext[0] || "";
  const isDirectory = currentPath.endsWith("/");
  const pathParts = currentPath.replace(/\/$/, "").split("/");
  const currentName = pathParts.pop() || "";
  const parentPath = pathParts.length > 0 ? pathParts.join("/") + "/" : "";

  const isConfirmed = confirmInput.toLowerCase() === CONFIRM_PHRASE;
  const hasValidName = newName.trim().length > 0 && newName !== currentName;

  // Initialize newName when modal opens
  useEffect(() => {
    if (openRename && currentName) {
      setNewName(currentName);
    }
  }, [openRename, currentName]);

  const handleClose = () => {
    setOpenRename(false);
    setNewName("");
    setConfirmInput("");
    setSelectedContext([]);
  };

  const handleRename = () => {
    if (!isConfirmed || !hasValidName) return;

    const newPath = parentPath + newName + (isDirectory ? "/" : "");

    renameMutation.mutate(
      {
        source: currentPath,
        dest: newPath,
        type: isDirectory ? "dir" : "file",
      },
      {
        onSuccess: () => {
          toast.success(`Renamed to "${newName}" successfully`);
          handleClose();
        },
        onError: (error) => {
          toast.error(`Failed to rename: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={openRename} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Rename {isDirectory ? "Folder" : "File"}
          </DialogTitle>
          <DialogDescription>
            Rename{" "}
            <span className="font-medium text-foreground">"{currentName}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">New name:</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              autoFocus
            />
            {newName === currentName && newName.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Name must be different from current name
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Type <span className="font-mono font-bold text-foreground">{CONFIRM_PHRASE}</span> to confirm:
            </label>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isConfirmed && hasValidName) {
                  handleRename();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={renameMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={!isConfirmed || !hasValidName || renameMutation.isPending}
          >
            {renameMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Renaming...
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
