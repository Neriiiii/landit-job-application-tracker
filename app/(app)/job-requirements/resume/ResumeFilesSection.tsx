import { useState, useCallback, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Image from "next/image";
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
  listResumeFiles,
  uploadResumeFile,
  deleteResumeFile,
  updateResumeFile,
  type ResumeFileWithUrl,
} from "@/app/actions/resume-files";
import { toast } from "@/lib/toast";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export type AddResumeFileFromBlobFn = (blob: Blob, suggestedName: string) => Promise<void>;

export type ResumeFilesSectionRef = {
  triggerImport: () => void;
  refresh: () => Promise<void>;
};

type Props = {
  userId: string;
  addFromBlobRef?: React.MutableRefObject<AddResumeFileFromBlobFn | null>;
  showLatestPdf?: boolean;
  importButtonInHeader?: boolean;
};

export const ResumeFilesSection = forwardRef<ResumeFilesSectionRef, Props>(
  function ResumeFilesSection(
    { userId, addFromBlobRef, showLatestPdf, importButtonInHeader },
    ref,
  ) {
    const [files, setFiles] = useState<ResumeFileWithUrl[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [importOpen, setImportOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingBlob, setPendingBlob] = useState<{ blob: Blob; suggestedName: string } | null>(
      null,
    );
    const [importName, setImportName] = useState("");
    const [importRole, setImportRole] = useState("");

    const [editOpen, setEditOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<ResumeFileWithUrl | null>(null);
    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editSaving, setEditSaving] = useState(false);

    const loadFiles = useCallback(async () => {
      setLoading(true);
      setError(null);
      const loadStarted = Date.now();
      try {
        const list = await listResumeFiles(userId);
        const elapsed = Date.now() - loadStarted;
        const minLoadMs = 1000;
        if (elapsed < minLoadMs) {
          await new Promise((r) => setTimeout(r, minLoadMs - elapsed));
        }
        setFiles(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load resume files.");
      } finally {
        setLoading(false);
      }
    }, [userId]);

    useImperativeHandle(
      ref,
      () => ({
        triggerImport: () => fileInputRef.current?.click(),
        refresh: loadFiles,
      }),
      [loadFiles],
    );

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
      setPendingBlob(null);
      setPendingFile(file);
      setImportName(file.name.replace(/\.pdf$/i, "") || "Resume");
      setImportRole("");
      setImportOpen(true);
    }, []);

    const handleImportSubmit = useCallback(async () => {
      const name = importName.trim() || "Resume";
      let file: File;
      if (pendingFile) {
        file = pendingFile;
      } else if (pendingBlob) {
        file = new File(
          [pendingBlob.blob],
          (pendingBlob.suggestedName || "Resume").replace(/\.pdf$/i, "") + ".pdf",
          { type: "application/pdf" },
        );
      } else {
        return;
      }
      setUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("name", name);
        formData.set("role", importRole.trim());
        await uploadResumeFile(userId, formData);
        await loadFiles();
        setImportOpen(false);
        setPendingFile(null);
        setPendingBlob(null);
        toast.success("Resume imported.");
      } catch (e) {
        const message = e instanceof Error ? e.message : "Upload failed.";
        setError(message);
        toast.error(message);
      } finally {
        setUploading(false);
      }
    }, [userId, loadFiles, pendingFile, pendingBlob, importName, importRole]);

    const openEditDialog = useCallback((file: ResumeFileWithUrl) => {
      setEditingFile(file);
      setEditName(file.name);
      setEditRole(file.role ?? "");
      setEditOpen(true);
    }, []);

    const handleEditSubmit = useCallback(async () => {
      if (!editingFile) return;
      setEditSaving(true);
      setError(null);
      try {
        await updateResumeFile(userId, editingFile.id, {
          name: editName.trim() || "Resume",
          role: editRole.trim() || null,
        });
        await loadFiles();
        setEditOpen(false);
        setEditingFile(null);
        toast.success("Resume updated.");
      } catch (e) {
        const message = e instanceof Error ? e.message : "Update failed.";
        setError(message);
        toast.error(message);
      } finally {
        setEditSaving(false);
      }
    }, [userId, editingFile, editName, editRole, loadFiles]);

    const closeImportModal = useCallback(() => {
      if (!uploading) {
        setImportOpen(false);
        setPendingFile(null);
        setPendingBlob(null);
      }
    }, [uploading]);

    const removeFile = useCallback(
      async (id: string) => {
        setDeletingId(id);
        setError(null);
        try {
          await deleteResumeFile(userId, id);
          await loadFiles();
          toast.success("Resume removed.");
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
        const name = (suggestedName || "Resume").replace(/\.pdf$/i, "").trim() || "Resume";
        const file = new File([blob], `${name}.pdf`, { type: "application/pdf" });
        setUploading(true);
        setError(null);
        try {
          const formData = new FormData();
          formData.set("file", file);
          formData.set("name", name);
          formData.set("role", "");
          await uploadResumeFile(userId, formData);
          await loadFiles();
          toast.success("Saved to my resumes.");
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

    const latestFile =
      showLatestPdf && files.length > 0
        ? [...files].sort(
            (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
          )[0]
        : null;

    return (
      <Card className="flex flex-col lg:min-h-0  lg:flex-1 rounded-2xl border-border/80 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 lg:flex-1 ">
          {error && <FormMessage variant="error">{error}</FormMessage>}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />

          {/* Import modal: name, role, upload date */}
          <Dialog open={importOpen} onOpenChange={(open) => !open && closeImportModal()}>
            <DialogContent size="sm" showCloseButton={!uploading}>
              <DialogHeader>
                <DialogTitle>Import resume</DialogTitle>
                <DialogDescription>Give this resume a name and an optional role.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="import-name">Name</Label>
                  <Input
                    id="import-name"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    placeholder="e.g. My Resume 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="import-role">Role (where to use it)</Label>
                  <Input
                    id="import-role"
                    value={importRole}
                    onChange={(e) => setImportRole(e.target.value)}
                    placeholder="e.g. Software Engineer"
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
                <DialogTitle>Edit resume details</DialogTitle>
                <DialogDescription>Update the name and role for this file.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. My Resume 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role (where to use it)</Label>
                  <Input
                    id="edit-role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
                  Cancel
                </Button>
                <Button onClick={handleEditSubmit} disabled={editSaving}>
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
                className="gap-2 rounded-lg px-6 text-base flex-1 sm:flex-none"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Import resume (PDF)
              </Button>
            </div>
          )}
          {loading ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Loading resume files…</p>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-1 min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-12 text-center">
              <FileText className="h-12 w-12 shrink-0 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium text-foreground">No resume files yet</p>
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

                  {/* Hover Tooltip - name + role */}
                  <div className="absolute inset-0 z-20 hidden xl:group-hover:block">
                    <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-md bg-black/90 px-3 py-2 text-xs text-white shadow-lg whitespace-pre-wrap max-w-[250px] wrap-break-word">
                      {file.name}
                      {file.role ? `\n${file.role}` : ""}
                    </div>
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
                          {file.role ? (
                            <p className="mt-1 text-xs text-muted-foreground sm:mt-0.5 sm:text-center line-clamp-1">
                              {file.role}
                            </p>
                          ) : null}
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
