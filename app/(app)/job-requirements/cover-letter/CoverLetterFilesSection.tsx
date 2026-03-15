"use client";

import { useState, useCallback, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { FormMessage } from "@/components/ui/FormMessage";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { FileText, Upload, Loader2, Trash2, Pencil } from "lucide-react";
import {
  listCoverLetterFiles,
  uploadCoverLetterFile,
  deleteCoverLetterFile,
  updateCoverLetterFile,
  type CoverLetterFileWithUrl,
} from "@/app/actions/cover-letter-files";
import { toast } from "@/lib/toast";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export type AddCoverLetterFileFromBlobFn = (blob: Blob, suggestedName: string) => void;

export type CoverLetterFilesSectionRef = { triggerImport: () => void };

type Props = {
  userId: string;
  addFromBlobRef?: React.MutableRefObject<AddCoverLetterFileFromBlobFn | null>;
  importButtonInHeader?: boolean;
};

export const CoverLetterFilesSection = forwardRef<CoverLetterFilesSectionRef, Props>(
  function CoverLetterFilesSection({ userId, addFromBlobRef, importButtonInHeader }, ref) {
    const [files, setFiles] = useState<CoverLetterFileWithUrl[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [importOpen, setImportOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [importName, setImportName] = useState("");

    const [editOpen, setEditOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<CoverLetterFileWithUrl | null>(null);
    const [editName, setEditName] = useState("");
    const [editSaving, setEditSaving] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        triggerImport: () => fileInputRef.current?.click(),
      }),
      [],
    );

    const loadFiles = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await listCoverLetterFiles(userId);
        setFiles(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load cover letter files.");
      } finally {
        setLoading(false);
      }
    }, [userId]);

    useEffect(() => {
      loadFiles();
    }, [loadFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || file.type !== "application/pdf") return;
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error("File is too large. Maximum size is 5MB.");
        return;
      }
      setPendingFile(file);
      setImportName(file.name.replace(/\.pdf$/i, "") || "Cover letter");
      setImportOpen(true);
    }, []);

    const closeImportModal = useCallback(() => {
      if (!uploading) {
        setImportOpen(false);
        setPendingFile(null);
      }
    }, [uploading]);

    const handleImportSubmit = useCallback(async () => {
      if (!pendingFile) return;
      const name = importName.trim() || "Cover letter";
      setUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.set("file", pendingFile);
        formData.set("name", name);
        await uploadCoverLetterFile(userId, formData);
        await loadFiles();
        setImportOpen(false);
        setPendingFile(null);
        toast.success("Cover letter imported.");
      } catch (e) {
        const message = e instanceof Error ? e.message : "Upload failed.";
        setError(message);
        toast.error(message);
      } finally {
        setUploading(false);
      }
    }, [userId, pendingFile, importName, loadFiles]);

    const openEditDialog = useCallback((file: CoverLetterFileWithUrl) => {
      setEditingFile(file);
      setEditName(file.name);
      setEditOpen(true);
    }, []);

    const handleEditSubmit = useCallback(async () => {
      if (!editingFile) return;
      setEditSaving(true);
      setError(null);
      try {
        await updateCoverLetterFile(userId, editingFile.id, {
          name: editName.trim() || "Cover letter",
        });
        await loadFiles();
        setEditOpen(false);
        setEditingFile(null);
        toast.success("Cover letter updated.");
      } catch (e) {
        const message = e instanceof Error ? e.message : "Update failed.";
        setError(message);
        toast.error(message);
      } finally {
        setEditSaving(false);
      }
    }, [userId, editingFile, editName, loadFiles]);

    const removeFile = useCallback(
      async (id: string) => {
        setDeletingId(id);
        setError(null);
        try {
          await deleteCoverLetterFile(userId, id);
          await loadFiles();
          toast.success("Cover letter removed.");
        } catch (e) {
          const message = e instanceof Error ? e.message : "Delete failed.";
          setError(message);
          toast.error(message);
        } finally {
          setDeletingId(null);
        }
      },
      [userId, loadFiles],
    );

    useEffect(() => {
      if (!addFromBlobRef) return;
      addFromBlobRef.current = async (blob: Blob, suggestedName: string) => {
        const name =
          (suggestedName || "Cover letter").replace(/\.pdf$/i, "").trim() || "Cover letter";
        setUploading(true);
        setError(null);
        try {
          const file = new File([blob], `${name}.pdf`, { type: "application/pdf" });
          const formData = new FormData();
          formData.set("file", file);
          formData.set("name", name);
          await uploadCoverLetterFile(userId, formData);
          await loadFiles();
          toast.success("Saved to my cover letters.");
        } catch (e) {
          const message = e instanceof Error ? e.message : "Save failed.";
          setError(message);
          toast.error(message);
          throw e;
        } finally {
          setUploading(false);
        }
      };
      return () => {
        addFromBlobRef.current = null;
      };
    }, [userId, addFromBlobRef, loadFiles]);

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
      <Card className="flex min-h-0 flex-1 flex-col rounded-2xl border-border/80 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 lg:flex-1">
          {error && <FormMessage variant="error">{error}</FormMessage>}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {/* Import modal */}
          <Dialog open={importOpen} onOpenChange={(open) => !open && closeImportModal()}>
            <DialogContent size="sm" showCloseButton={!uploading}>
              <DialogHeader>
                <DialogTitle>Import cover letter</DialogTitle>
                <DialogDescription>Give this cover letter a name.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="import-cover-name">Name</Label>
                  <Input
                    id="import-cover-name"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    placeholder="e.g. Cover letter – Acme"
                    disabled={uploading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeImportModal} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={handleImportSubmit} disabled={uploading || !importName.trim()}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit modal */}
          <Dialog
            open={editOpen}
            onOpenChange={(open) => !open && !editSaving && setEditOpen(false)}
          >
            <DialogContent size="sm" showCloseButton={!editSaving}>
              <DialogHeader>
                <DialogTitle>Edit cover letter</DialogTitle>
                <DialogDescription>Rename this file.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-4 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cover-name">Name</Label>
                  <Input
                    id="edit-cover-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Cover letter – Acme"
                    disabled={editSaving}
                  />
                </div>
              </div>
              <DialogFooter className="border-t border-border p-4">
                <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
                  Cancel
                </Button>
                <Button onClick={handleEditSubmit} disabled={editSaving || !editName.trim()}>
                  {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {!importButtonInHeader && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg px-6 text-base"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Import cover letter (PDF)
              </Button>
            </div>
          )}
          {loading ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Loading cover letter files…</p>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="flex min-h-48 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-12 text-center">
              <FileText className="h-12 w-12 shrink-0 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium text-foreground">No cover letter files yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Import a PDF or save one from the builder above.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-6">
              {files.map((file) => (
                <Card
                  key={file.id}
                  className="group relative col-span-1 overflow-hidden border-border/80 transition-[border-color,box-shadow,background-color] hover:border-border hover:bg-primary/5 hover:shadow-sm"
                >
                  <div className="absolute right-2 top-2 z-30 flex gap-0.5 sm:right-1 sm:top-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 p-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent hover:text-foreground sm:h-8 sm:w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditDialog(file);
                      }}
                      aria-label="Edit"
                    >
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 shrink-0 p-0 text-muted-foreground transition-opacity hover:bg-transparent hover:text-destructive sm:h-8 sm:w-8 ${deletingId === file.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      disabled={deletingId === file.id}
                      aria-label="Delete"
                    >
                      {deletingId === file.id ? (
                        <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                      ) : (
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </div>

                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block cursor-pointer relative z-10"
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="grid grid-cols-[auto_1fr] items-center gap-3 sm:flex sm:flex-col sm:items-center sm:gap-2">
                        <div className="flex shrink-0 items-center justify-center sm:h-16 sm:w-16">
                          <Image
                            src="/PDFIcon.svg"
                            alt=""
                            width={48}
                            height={48}
                            className="object-contain sm:w-64 sm:h-64"
                            sizes="(max-width: 640px) 48px, 64px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="line-clamp-2 text-xs font-medium text-foreground sm:mt-2 sm:text-sm sm:line-clamp-1 sm:text-center"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground sm:mt-0.5 sm:text-center line-clamp-1">
                            PDF {file.size != null ? `• ${formatFileSize(file.size)}` : ""}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </a>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);
