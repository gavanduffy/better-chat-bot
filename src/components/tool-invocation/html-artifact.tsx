"use client";

import { useCopy } from "@/hooks/use-copy";
import { ToolUIPart } from "ai";
import { cn } from "lib/utils";
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  MaximizeIcon,
  MinimizeIcon,
} from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
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
        | "xml";
    }>;
  };

  const { title, description, html, files } = input;

  // Normalize files to use path property (support both old and new schema)
  const normalizedFiles = files?.map((file) => ({
    ...file,
    path: file.path || file.name || "unknown",
  }));

  // Create a blob URL for the iframe to ensure proper sandboxing
  const iframeSrc = useMemo(() => {
    let processedHtml = html;

    // If there are additional files, inject them into the HTML
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
  }, [html, normalizedFiles]);

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
      } catch (error) {
        console.error("Error creating ZIP:", error);
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
            >
              <DownloadIcon className="size-3.5" />
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
              <div className="w-48 border rounded-lg overflow-auto bg-muted/20">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => setSelectedFile("index.html")}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-xs hover:bg-accent transition-colors",
                      selectedFile === "index.html" && "bg-accent",
                    )}
                  >
                    📄 index.html
                  </button>
                  {normalizedFiles.map((file) => {
                    const fileIcon =
                      file.type === "css"
                        ? "🎨"
                        : file.type === "js"
                          ? "📜"
                          : file.type === "ts"
                            ? "📘"
                            : file.type === "html"
                              ? "🌐"
                              : file.type === "json"
                                ? "📋"
                                : file.type === "md"
                                  ? "📝"
                                  : file.type === "svg"
                                    ? "🖼️"
                                    : file.type === "xml"
                                      ? "📑"
                                      : "📄";

                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file.path)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded text-xs hover:bg-accent transition-colors truncate",
                          selectedFile === file.path && "bg-accent",
                        )}
                        title={file.path}
                      >
                        {fileIcon} {file.path}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File content viewer */}
              <div className="flex-1 border rounded-lg overflow-auto">
                {selectedFile === "index.html" ? (
                  <CodeBlock lang="html" code={html} />
                ) : (
                  (() => {
                    const file = normalizedFiles.find(
                      (f) => f.path === selectedFile,
                    );
                    if (!file) return null;
                    const lang =
                      file.type === "ts"
                        ? "typescript"
                        : file.type === "js"
                          ? "javascript"
                          : file.type === "html"
                            ? "html"
                            : file.type === "css"
                              ? "css"
                              : file.type === "json"
                                ? "json"
                                : file.type === "md"
                                  ? "markdown"
                                  : file.type === "svg"
                                    ? "xml"
                                    : file.type === "xml"
                                      ? "xml"
                                      : "plaintext";
                    return <CodeBlock lang={lang} code={file.content} />;
                  })()
                )}
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
