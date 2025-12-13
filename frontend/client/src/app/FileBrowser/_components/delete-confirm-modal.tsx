import { useState } from "react";
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
import { Loader2, Trash2 } from "lucide-react";
import useFileStore from "@/store/fileStore";
import { useDeleteFiles } from "@/app/FileBrowser/_lib/filesystem/useDeleteFile";
import { toast } from "sonner";

const CONFIRM_PHRASE = "delete";

export default function DeleteConfirmModal() {
  const { openDeleteModal, setOpenDeleteModal, selectedContext, setSelectedContext } = useFileStore();
  const deleteMutation = useDeleteFiles();
  const [inputValue, setInputValue] = useState("");

  const isConfirmed = inputValue.toLowerCase() === CONFIRM_PHRASE;
  const fileCount = selectedContext.length;
  const fileName = fileCount === 1 ? selectedContext[0].split("/").pop() : null;

  const handleClose = () => {
    setOpenDeleteModal(false);
    setInputValue("");
    setSelectedContext([]);
  };

  const handleDelete = () => {
    if (!isConfirmed) return;

    deleteMutation.mutate(selectedContext, {
      onSuccess: () => {
        toast.success(
          fileCount === 1
            ? `"${fileName}" deleted successfully`
            : `${fileCount} items deleted successfully`
        );
        handleClose();
      },
      onError: (error) => {
        toast.error(`Failed to delete: ${error.message}`);
      },
    });
  };

  return (
    <Dialog open={openDeleteModal} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete {fileCount === 1 ? "File" : `${fileCount} Items`}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">
              {fileCount === 1 ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">"{fileName}"</span>?
                </>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">{fileCount} items</span>?
                </>
              )}
            </span>
            <span className="block text-red-600">This action cannot be undone.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label className="text-sm text-muted-foreground">
            Type <span className="font-mono font-bold text-foreground">{CONFIRM_PHRASE}</span> to confirm:
          </label>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && isConfirmed) {
                handleDelete();
              }
            }}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
