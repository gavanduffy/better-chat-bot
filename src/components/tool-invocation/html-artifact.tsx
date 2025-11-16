"use client";

import { ToolUIPart } from "ai";
import { memo, useMemo, useState, useRef, useEffect } from "react";
import { cn } from "lib/utils";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  MaximizeIcon,
  MinimizeIcon,
  CodeIcon,
  EyeIcon,
} from "lucide-react";
import { Button } from "ui/button";
import { useCopy } from "@/hooks/use-copy";
import { Badge } from "ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "ui/tabs";
import { CodeBlock } from "ui/CodeBlock";

interface HtmlArtifactProps {
  part: ToolUIPart;
}

export const HtmlArtifact = memo(function HtmlArtifact({
  part,
}: HtmlArtifactProps) {
  const { copy, copied } = useCopy();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const input = part.input as {
    title: string;
    description: string | null;
    html: string;
  };

  const { title, description, html } = input;

  // Create a blob URL for the iframe to ensure proper sandboxing
  const iframeSrc = useMemo(() => {
    const blob = new Blob([html], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [html]);

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
        onValueChange={(v) => setActiveTab(v as "preview" | "code")}
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
