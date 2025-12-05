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
  PencilIcon,
  PresentationIcon,
} from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CodeBlock } from "ui/CodeBlock";
import { Badge } from "ui/badge";
import { Button } from "ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "ui/tabs";
import { Textarea } from "ui/textarea";

interface HtmlArtifactProps {
  part: ToolUIPart;
}

interface ParsedSlide {
  id: string;
  index: number;
  content: string; // Inner HTML of the slide
  fullHtml: string; // Full HTML document for the slide (including head)
}

export const HtmlArtifact = memo(function HtmlArtifact({
  part,
}: HtmlArtifactProps) {
  const { copy, copied } = useCopy();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "files">(
    "preview",
  );
  const [parsedSlides, setParsedSlides] = useState<ParsedSlide[]>([]);

  const input = part.input as {
    title: string;
    description: string | null;
    html: string;
    files?: Array<{
      path?: string;
      name?: string;
      content: string;
      type: string;
    }>;
  };

  const { title, description, html, files } = input;

  const normalizedFiles = useMemo(
    () =>
      files?.map((file) => ({
        ...file,
        path: file.path || file.name || "unknown",
      })),
    [files],
  );

  // Parse slides from HTML
  useEffect(() => {
    if (!html) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const slideElements = doc.querySelectorAll(".slide, section");

      if (slideElements.length > 0) {
        const headContent = doc.head.innerHTML;
        const slides: ParsedSlide[] = Array.from(slideElements).map(
          (el, idx) => {
            // Create a complete HTML document for this slide
            const slideContent = el.outerHTML;
            const fullHtml = `<!DOCTYPE html>
<html>
<head>
${headContent}
<style>
  body { margin: 0; padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: white; }
  /* Ensure the slide takes full space if needed */
  .slide, section { width: 100%; height: 100%; box-sizing: border-box; overflow: auto; padding: 2rem; }
</style>
</head>
<body>
${slideContent}
</body>
</html>`;
            return {
              id: `slide-${idx}`,
              index: idx,
              content: slideContent,
              fullHtml,
            };
          },
        );
        setParsedSlides(slides);
      } else {
        setParsedSlides([]);
      }
    } catch (e) {
      console.error("Failed to parse slides", e);
      setParsedSlides([]);
    }
  }, [html]);

  // Create a blob URL for the main iframe (single view)
  const iframeSrc = useMemo(() => {
    let processedHtml = html;

    if (normalizedFiles && normalizedFiles.length > 0) {
      const cssFiles = normalizedFiles.filter((f) => f.type === "css");
      const jsFiles = normalizedFiles.filter(
        (f) => f.type === "js" || f.type === "ts",
      );

      if (cssFiles.length > 0) {
        const cssContent = cssFiles
          .map(
            (file) =>
              `<style data-file="${file.path}">\n${file.content}\n</style>`,
          )
          .join("\n");
        if (processedHtml.includes("</head>")) {
          processedHtml = processedHtml.replace(
            "</head>",
            `${cssContent}\n</head>`,
          );
        } else {
          processedHtml = cssContent + processedHtml;
        }
      }

      if (jsFiles.length > 0) {
        const jsContent = jsFiles
          .map(
            (file) =>
              `<script data-file="${file.path}">\n${file.content}\n</script>`,
          )
          .join("\n");
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

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (iframeSrc) {
        URL.revokeObjectURL(iframeSrc);
      }
    };
  }, [iframeSrc]);

  const handleDownloadZip = async () => {
    const projectName = title.toLowerCase().replace(/\s+/g, "-");
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      zip.file("index.html", html);
      if (normalizedFiles) {
        for (const file of normalizedFiles) {
          zip.file(file.path, file.content);
        }
      }
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
    }
  };

  const handleDownloadPptx = async () => {
    try {
      const pptxgen = (await import("pptxgenjs")).default;
      const pres = new pptxgen();

      // If we have parsed slides, use them
      const slidesToProcess =
        parsedSlides.length > 0
          ? parsedSlides.map((s) => s.content)
          : [html]; // Fallback to full html if no slides detected (unlikely for ppt request)

      // We need to parse each slide content to extract text/images
      const parser = new DOMParser();

      slidesToProcess.forEach((slideHtml) => {
        const doc = parser.parseFromString(slideHtml, "text/html");
        const slide = pres.addSlide();

        // Basic styling attempt
        slide.background = { color: "FFFFFF" };

        let yPos = 0.5;

        // Title
        const titleEl = doc.querySelector("h1, h2, h3");
        if (titleEl) {
            slide.addText(titleEl.textContent?.trim() || "", {
                x: 0.5, y: yPos, w: "90%", h: 1, fontSize: 24, bold: true, color: "363636"
            });
            yPos += 1.2;
        }

        // Content
        const contentEls = doc.querySelectorAll("p, li, img");
        contentEls.forEach((el) => {
             // Avoid duplicating title if it was caught in query
             if (titleEl && titleEl.contains(el)) return;

             if (el.tagName === "IMG") {
                 const src = el.getAttribute("src");
                 if (src && (src.startsWith("http") || src.startsWith("data:"))) {
                     slide.addImage({ path: src, x: 0.5, y: yPos, w: 5, h: 3 });
                     yPos += 3.2;
                 }
             } else {
                 const text = el.textContent?.trim();
                 if (text) {
                     slide.addText(text, {
                         x: 0.5, y: yPos, w: "90%", h: 0.5, fontSize: 14,
                         bullet: el.tagName === "LI", color: "666666"
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

  const isPresentation = parsedSlides.length > 0;

  return (
    <div className="w-full flex flex-col gap-3 my-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          {isPresentation ? (
            <PresentationIcon className="size-4 text-primary" />
          ) : (
            <CodeIcon className="size-4 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                        <DownloadIcon className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDownloadPptx}>
                        <PresentationIcon className="mr-2 size-4" />
                        Download as PPTX
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadZip}>
                        <DownloadIcon className="mr-2 size-4" />
                        Download as ZIP
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

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
        </div>
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

          {/* Global View Toggle (only for single view) */}
          {activeTab === "preview" && !isPresentation && (
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

        <TabsContent value="preview" className="mt-0 space-y-4">
          {isPresentation ? (
            // Presentation View (List of Slides)
            <div className="flex flex-col gap-6">
                {parsedSlides.map((slide) => (
                    <SlidePreview key={slide.id} slide={slide} total={parsedSlides.length} />
                ))}
            </div>
          ) : (
            // Single Artifact View
            <div
                className={cn(
                "w-full border rounded-lg overflow-hidden bg-white transition-all duration-300",
                isExpanded ? "h-[600px]" : "h-[400px]",
                )}
            >
                <iframe
                src={iframeSrc}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
                title={title}
                />
            </div>
          )}
        </TabsContent>

        <TabsContent value="code" className="mt-0">
          <div className="max-h-[500px] overflow-auto rounded-lg border">
            <CodeBlock lang="html" code={html} />
          </div>
        </TabsContent>

        {normalizedFiles && normalizedFiles.length > 0 && (
          <TabsContent value="files" className="mt-0">
             {/* Reusing existing file viewer logic... */}
             <FileViewer html={html} files={normalizedFiles} />
          </TabsContent>
        )}
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs">
          Sandboxed
        </Badge>
        <span>•</span>
        <span>{isPresentation ? "Slides parsed from artifact" : "Runs in isolated environment"}</span>
      </div>
    </div>
  );
});

HtmlArtifact.displayName = "HtmlArtifact";

// Sub-components

const SlidePreview = memo(function SlidePreview({ slide, total }: { slide: ParsedSlide, total: number }) {
    const [mode, setMode] = useState<"preview" | "code">("preview");
    const [showFeedback, setShowFeedback] = useState(false);

    // Create blob for slide
    const slideSrc = useMemo(() => {
        const blob = new Blob([slide.fullHtml], { type: "text/html" });
        return URL.createObjectURL(blob);
    }, [slide.fullHtml]);

    useEffect(() => {
        return () => {
            if (slideSrc) URL.revokeObjectURL(slideSrc);
        }
    }, [slideSrc]);

    const handleFeedbackCopy = (text: string) => {
        const feedback = `Feedback for Slide ${slide.index + 1}: ${text}`;
        navigator.clipboard.writeText(feedback);
        toast.success("Feedback copied to clipboard");
        setShowFeedback(false);
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            {/* Slide Header */}
            <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Button
                        variant={mode === "preview" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setMode("preview")}
                    >
                        Preview
                    </Button>
                    <Button
                        variant={mode === "code" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setMode("code")}
                    >
                        Code
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                     <span className="text-xs text-muted-foreground font-mono">
                        {slide.index + 1} / {total}
                     </span>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => setShowFeedback(!showFeedback)}
                     >
                        <PencilIcon className="size-3.5" />
                     </Button>
                </div>
            </div>

            {/* Feedback Input */}
            {showFeedback && (
                <div className="p-3 border-b bg-muted/10 animate-in slide-in-from-top-2">
                    <div className="relative">
                        <Textarea
                            placeholder={`Enter feedback for slide ${slide.index + 1}...`}
                            className="min-h-[80px] text-xs resize-none pr-10"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleFeedbackCopy(e.currentTarget.value);
                                }
                            }}
                        />
                        <Button
                            size="icon"
                            className="absolute bottom-2 right-2 size-6"
                            onClick={(e) => {
                                const ta = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                                handleFeedbackCopy(ta.value);
                            }}
                        >
                            <CheckIcon className="size-3" />
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                        Press Enter to copy feedback
                    </p>
                </div>
            )}

            {/* Content */}
            <div className="aspect-video w-full bg-white relative">
                 {mode === "preview" ? (
                     <iframe
                        src={slideSrc}
                        className="w-full h-full border-0"
                        title={`Slide ${slide.index + 1}`}
                        sandbox="allow-scripts allow-same-origin"
                     />
                 ) : (
                     <div className="absolute inset-0 overflow-auto bg-zinc-950 p-4">
                         <CodeBlock lang="html" code={slide.content} />
                     </div>
                 )}
            </div>
        </div>
    );
});

// Extracted FileViewer for cleaner code
const FileViewer = ({ html, files }: { html: string, files: any[] }) => {
    const [selectedFile, setSelectedFile] = useState("index.html");

    return (
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
                key={file.path}
                onClick={() => setSelectedFile(file.path)}
                className={cn(
                    "w-full text-left px-3 py-2 rounded text-xs hover:bg-accent transition-colors truncate",
                    selectedFile === file.path && "bg-accent",
                )}
                title={file.path}
                >
                📄 {file.path}
                </button>
            ))}
            </div>
        </div>

        {/* File content viewer */}
        <div className="flex-1 border rounded-lg overflow-auto">
            {selectedFile === "index.html" ? (
            <CodeBlock lang="html" code={html} />
            ) : (
            <CodeBlock lang="html" code={files.find(f => f.path === selectedFile)?.content || ""} />
            )}
        </div>
        </div>
    )
}
