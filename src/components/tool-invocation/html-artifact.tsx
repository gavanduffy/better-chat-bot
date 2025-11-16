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
      name: string;
      content: string;
      type: "css" | "js" | "ts";
    }>;
  };

  const { title, description, html, files } = input;

  // Create a blob URL for the iframe to ensure proper sandboxing
  const iframeSrc = useMemo(() => {
    let processedHtml = html;

    // If there are additional files, inject them into the HTML
    if (files && files.length > 0) {
      // Group files by type
      const cssFiles = files.filter((f) => f.type === "css");
      const jsFiles = files.filter((f) => f.type === "js");
      const tsFiles = files.filter((f) => f.type === "ts");

      // Inject CSS files into the head
      if (cssFiles.length > 0) {
        const cssContent = cssFiles
          .map(
            (file) =>
              `<style data-file="${file.name}">\n${file.content}\n</style>`,
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
              `<script data-file="${file.name}">\n${file.content}\n</script>`,
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
  }, [html, files]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (iframeSrc) {
        URL.revokeObjectURL(iframeSrc);
      }
    };
  }, [iframeSrc]);

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.html`;
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
          HTML Artifact
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
            {files && files.length > 0 && (
              <TabsTrigger value="files" className="text-xs">
                <CodeIcon className="size-3 mr-1.5" />
                Files ({files.length + 1})
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

        {files && files.length > 0 && (
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
                  {files.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFile(file.name)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded text-xs hover:bg-accent transition-colors",
                        selectedFile === file.name && "bg-accent",
                      )}
                    >
                      {file.type === "css" && "🎨"}
                      {file.type === "js" && "📜"}
                      {file.type === "ts" && "📘"} {file.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* File content viewer */}
              <div className="flex-1 border rounded-lg overflow-auto">
                {selectedFile === "index.html" ? (
                  <CodeBlock lang="html" code={html} />
                ) : (
                  (() => {
                    const file = files.find((f) => f.name === selectedFile);
                    if (!file) return null;
                    const lang =
                      file.type === "ts"
                        ? "typescript"
                        : file.type === "js"
                          ? "javascript"
                          : "css";
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
