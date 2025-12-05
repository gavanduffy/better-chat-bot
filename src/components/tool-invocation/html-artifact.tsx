"use client";

import { useCopy } from "@/hooks/use-copy";
import { ToolUIPart } from "ai";
import { FileTree } from "@/components/artifact/FileTree";
import { VirtualFileSystem, VirtualFile } from "lib/artifact/virtual-fs";
import { cn } from "lib/utils";
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  MaximizeIcon,
  MinimizeIcon,
  PresentationIcon,
} from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CodeBlock } from "ui/CodeBlock";
import { Badge } from "ui/badge";
import { Button } from "ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "ui/tabs";

interface HtmlArtifactProps {
  part: ToolUIPart;
}

export const HtmlArtifact = memo(function HtmlArtifact({
  part,
}: HtmlArtifactProps) {
  const { copy, copied } = useCopy();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "files">(
    "preview",
  );
  const [selectedFile, setSelectedFile] = useState<string>("index.html");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const input = part.input as {
    title: string;
    description: string | null;
    html: string;
    entryPoint?: string;
    files?: Array<{
      path?: string; // New schema
      name?: string; // Legacy schema support
      content: string;
      type:
        | "css"
        | "js"
        | "ts"
        | "html"
        | "json"
        | "md"
        | "svg"
        | "txt"
        | "xml"
        | "png"
        | "jpg"
        | "jpeg"
        | "gif"
        | "webp";
      isFolder?: boolean;
      mimeType?: string;
      encoding?: "utf-8" | "base64";
    }>;
  };

  const { title, description, html, files, entryPoint } = input;

  // Normalize files to use path property (support both old and new schema)
  const normalizedFiles = useMemo(() => {
     return files?.map((file) => ({
      ...file,
      path: file.path || file.name || "unknown",
      // Ensure type matches strict type in VirtualFile
      type: file.type || "txt",
    })) as VirtualFile[];
  }, [files]);

  // Initialize virtual file system
  const vfs = useMemo(() => {
    const initialFiles: VirtualFile[] = [
        {
            path: "index.html",
            content: html,
            type: "html"
        }
    ];

    if (normalizedFiles) {
        initialFiles.push(...normalizedFiles);
    }

    return new VirtualFileSystem(initialFiles);
  }, [html, normalizedFiles]);

  const fileTreeRoot = useMemo(() => vfs.getFileTree(), [vfs]);

  // Create a blob URL for the iframe to ensure proper sandboxing
  const iframeSrc = useMemo(() => {
    // If we have an explicit entry point, try to find it
    let mainFile = vfs.readFile(entryPoint || "index.html");

    // Fallback to html input if index.html is requested but not in explicit files
    // (Though we added it to VFS, so it should be there)

    if (!mainFile) {
        // Find any html file
        const allFiles = vfs.getAllFiles();
        mainFile = allFiles.find(f => f.type === 'html');
    }

    if (!mainFile) return "";

    let processedHtml = mainFile.content;

    // For now, we stick with the simple injection logic for backward compatibility
    // but extended to use VFS concepts if needed.
    // However, if it's a multi-file project, we might want to just serve the entry point
    // and let the browser resolve relative paths if we could intercept them.
    // Since we are using a blob URL, relative paths won't work out of the box unless we construct
    // a complex blob or use a service worker (which is hard in this context).

    // So we continue with injection for single-file-like behavior,
    // BUT for "Project" structure we really need a way to handle relative paths.
    // The current implementation only injects JS/CSS. It doesn't handle images or relative links.

    // IMPROVEMENT: Basic handling of relative JS/CSS injection based on VFS
    if (normalizedFiles && normalizedFiles.length > 0) {
      // Group files by type
      const cssFiles = normalizedFiles.filter((f) => f.type === "css");
      const jsFiles = normalizedFiles.filter((f) => f.type === "js");
      const tsFiles = normalizedFiles.filter((f) => f.type === "ts");

      // Inject CSS files into the head
      if (cssFiles.length > 0) {
        const cssContent = cssFiles
          .map(
            (file) =>
              `<style data-file="${file.path}">\n${file.content}\n</style>`,
          )
          .join("\n");

        // Try to inject before </head>, or at the start of <head>, or at the start of the document
        if (processedHtml.includes("</head>")) {
          processedHtml = processedHtml.replace(
            "</head>",
            `${cssContent}\n</head>`,
          );
        } else if (processedHtml.includes("<head>")) {
          processedHtml = processedHtml.replace(
            "<head>",
            `<head>\n${cssContent}`,
          );
        } else {
          processedHtml = cssContent + processedHtml;
        }
      }

      // Inject JS/TS files into the body
      if (jsFiles.length > 0 || tsFiles.length > 0) {
        const jsContent = [...jsFiles, ...tsFiles]
          .map(
            (file) =>
              `<script data-file="${file.path}">\n${file.content}\n</script>`,
          )
          .join("\n");

        // Try to inject before </body>, or at the end of the document
        if (processedHtml.includes("</body>")) {
          processedHtml = processedHtml.replace(
            "</body>",
            `${jsContent}\n</body>`,
          );
        } else {
          processedHtml = processedHtml + jsContent;
        }
      }
    }

    const blob = new Blob([processedHtml], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [html, normalizedFiles, vfs, entryPoint]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (iframeSrc) {
        URL.revokeObjectURL(iframeSrc);
      }
    };
  }, [iframeSrc]);

  const handleDownload = async () => {
    const projectName = title.toLowerCase().replace(/\s+/g, "-");

    // If there are multiple files, create a ZIP
    if (normalizedFiles && normalizedFiles.length > 0) {
      try {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();

        // Add the main HTML file
        zip.file("index.html", html);

        // Add all other files, creating folders as needed
        for (const file of normalizedFiles) {
          zip.file(file.path, file.content);
        }

        // Generate the ZIP file
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Project downloaded as ZIP");
      } catch (error) {
        console.error("Error creating ZIP:", error);
        toast.error("Failed to create ZIP");
        // Fallback to single HTML download
        downloadSingleFile();
      }
    } else {
      // Single file download
      downloadSingleFile();
    }
  };

  const downloadSingleFile = () => {
    const projectName = title.toLowerCase().replace(/\s+/g, "-");
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Artifact downloaded");
  };

  const handleDownloadPptx = async () => {
    try {
      const pptxgen = (await import("pptxgenjs")).default;
      const pres = new pptxgen();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Look for slides defined by class "slide" or section tags
      const slides = doc.querySelectorAll(".slide, section");

      if (slides.length === 0) {
        toast.error(
          "No slides detected. Please ensure the HTML contains elements with class 'slide' or <section> tags.",
        );
        return;
      }

      slides.forEach((slideEl) => {
        const slide = pres.addSlide();

        // Extract title (h1-h6)
        const titleEl = slideEl.querySelector("h1, h2, h3, h4, h5, h6");
        let yPos = 0.5;

        if (titleEl) {
          const titleText = titleEl.textContent?.trim() || "";
          slide.addText(titleText, {
            x: 0.5,
            y: yPos,
            w: "90%",
            h: 1,
            fontSize: 24,
            bold: true,
            color: "363636",
          });
          yPos += 1.0;
        }

        // Extract content (p, ul, ol, img)
        // We look for direct children or simplified content structure
        const contentElements = slideEl.querySelectorAll("p, li, img");

        contentElements.forEach((el) => {
          // Skip if element is inside the title we already processed
          if (titleEl && titleEl.contains(el)) return;

          if (el.tagName === "IMG") {
            const img = el as HTMLImageElement;
            const src = img.getAttribute("src");
            if (src) {
              // Handle relative paths if they are in the project files
              // This is complex for blob urls or local files.
              // For now, assume remote URLs or skip.
              // If it's a data URL it works.
              if (src.startsWith("http") || src.startsWith("data:")) {
                slide.addImage({ path: src, x: 0.5, y: yPos, w: 4, h: 3 });
                yPos += 3.2;
              }
            }
          } else {
            const text = el.textContent?.trim();
            if (text) {
              slide.addText(text, {
                x: 0.5,
                y: yPos,
                w: "90%",
                h: 0.5,
                fontSize: 14,
                bullet: el.tagName === "LI",
                color: "666666",
              });
              yPos += 0.6;
            }
          }
        });
      });

      const projectName = title.toLowerCase().replace(/\s+/g, "-");
      await pres.writeFile({ fileName: `${projectName}.pptx` });
      toast.success("Presentation downloaded as PPTX");
    } catch (error) {
      console.error("Error generating PPTX:", error);
      toast.error("Failed to generate PPTX");
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 my-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CodeIcon className="size-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="text-xs">
          {normalizedFiles && normalizedFiles.length > 0
            ? `Project (${normalizedFiles.length + 1} files)`
            : "HTML Artifact"}
        </Badge>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "preview" | "code" | "files")}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="preview" className="text-xs">
              <EyeIcon className="size-3 mr-1.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs">
              <CodeIcon className="size-3 mr-1.5" />
              Code
            </TabsTrigger>
            {normalizedFiles && normalizedFiles.length > 0 && (
              <TabsTrigger value="files" className="text-xs">
                <CodeIcon className="size-3 mr-1.5" />
                Files ({normalizedFiles.length + 1})
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => copy(html)}
            >
              {copied ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleDownload}
              title="Download Artifact"
            >
              <DownloadIcon className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleDownloadPptx}
              title="Download as PPTX"
            >
              <PresentationIcon className="size-3.5" />
            </Button>
            {activeTab === "preview" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <MinimizeIcon className="size-3.5" />
                ) : (
                  <MaximizeIcon className="size-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="preview" className="mt-0">
          <div
            className={cn(
              "w-full border rounded-lg overflow-hidden bg-white transition-all duration-300",
              isExpanded ? "h-[600px]" : "h-[400px]",
            )}
          >
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
              title={title}
            />
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-0">
          <div className="max-h-[500px] overflow-auto rounded-lg border">
            <CodeBlock lang="html" code={html} />
          </div>
        </TabsContent>

        {normalizedFiles && normalizedFiles.length > 0 && (
          <TabsContent value="files" className="mt-0">
            <div className="flex gap-2 h-[500px]">
              {/* File list sidebar */}
              <div className="w-64 border rounded-lg overflow-hidden bg-muted/20 flex flex-col">
                <div className="p-2 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Files
                </div>
                <FileTree
                    root={fileTreeRoot}
                    selectedPath={selectedPath => setSelectedFile(selectedPath)}
                    selectedPath={selectedFile}
                    onSelectFile={setSelectedFile}
                    className="flex-1"
                />
              </div>

              {/* File content viewer */}
              <div className="flex-1 border rounded-lg overflow-auto">
                {(() => {
                    const file = vfs.readFile(selectedFile);
                    if (!file) return (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            Select a file to view content
                        </div>
                    );

                    const lang =
                      file.type === "ts" || file.type === "tsx"
                        ? "typescript"
                        : file.type === "js" || file.type === "jsx"
                          ? "javascript"
                          : file.type === "html"
                            ? "html"
                            : file.type === "css"
                              ? "css"
                              : file.type === "json"
                                ? "json"
                                : file.type === "md"
                                  ? "markdown"
                                  : file.type === "svg" || file.type === "xml"
                                    ? "xml"
                                    : "plaintext";
                    return <CodeBlock lang={lang} code={file.content} />;
                  })()}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs">
          Sandboxed
        </Badge>
        <span>•</span>
        <span>This artifact runs in a secure, isolated environment</span>
      </div>
    </div>
  );
});

HtmlArtifact.displayName = "HtmlArtifact";
