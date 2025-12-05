"use client";

import { useThreadFileUploader } from "@/hooks/use-thread-file-uploader";
import { useFileDragOverlay } from "@/hooks/use-file-drag-overlay";
import { useCallback } from "react";
import { FilePlus } from "lucide-react";

export function FileDropZone({ threadId }: { threadId: string }) {
  const { uploadFiles } = useThreadFileUploader(threadId);
  const handleFileDrop = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      await uploadFiles(files);
    },
    [uploadFiles],
  );
  const { isDragging } = useFileDragOverlay({
    onDropFiles: handleFileDrop,
  });

  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 z-40 bg-background/70 backdrop-blur-sm flex items-center justify-center pointer-events-none">
      <div className="rounded-2xl px-6 py-5 bg-background/80 shadow-xl border border-border flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <FilePlus className="size-6" />
        </div>
        <span className="text-sm text-muted-foreground">
          Drop files to upload
        </span>
      </div>
    </div>
  );
}
