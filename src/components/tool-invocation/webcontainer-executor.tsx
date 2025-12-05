"use client";

import { useCopy } from "@/hooks/use-copy";
import { ToolUIPart } from "ai";
import { cn } from "lib/utils";
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronRight,
  CopyIcon,
  ExternalLinkIcon,
  Loader,
  Percent,
  PlayIcon,
  ServerIcon,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { safe } from "ts-safe";

import { CodeBlock } from "ui/CodeBlock";
import { Skeleton } from "ui/skeleton";
import { TextShimmer } from "ui/text-shimmer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "ui/tabs";

import {
  WebContainerLogEntry,
  WebContainerResult,
  WebContainerStatus,
  WebContainerServerInfo,
} from "lib/webcontainer/types";

interface WebContainerExecutorProps {
  part: ToolUIPart;
  onResult?: (result: unknown) => void;
}

export const WebContainerExecutor = memo(function WebContainerExecutor({
  part,
  onResult,
}: WebContainerExecutorProps) {
  const isRun = useRef(false);
  const { copy, copied } = useCopy();
  const [isExecuting, setIsExecuting] = useState(false);
  const [status, setStatus] = useState<WebContainerStatus>("idle");
  const [realtimeLogs, setRealtimeLogs] = useState<WebContainerLogEntry[]>([]);
  const [serverInfo, setServerInfo] = useState<WebContainerServerInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"console" | "preview" | "files">("console");
  const codeResultContainerRef = useRef<HTMLDivElement>(null);
  const lastStartedAt = useRef<number>(Date.now());

  const input = useMemo(() => {
    return part.input as {
      files: Record<string, string>;
      command: string;
      installDeps?: boolean;
    } | null;
  }, [part.input]);

  const result = useMemo(() => {
    if (part.state.startsWith("input")) return null;
    return part.output as WebContainerResult | null;
  }, [part.state, part.output]);

  const runWebContainer = useCallback(
    async (
      files: Record<string, string>,
      command: string,
      installDeps: boolean,
    ): Promise<WebContainerResult> => {
      lastStartedAt.current = Date.now();
      setStatus("booting");
      setRealtimeLogs([]);
      setServerInfo(null);

      try {
        // Dynamic import to avoid SSR issues
        const { executeWebContainer } = await import(
          "lib/webcontainer/webcontainer-manager"
        );

        const result = await executeWebContainer({
          files,
          command,
          installDeps,
          timeout: 60000,
          onLog: (log) => {
            setRealtimeLogs((prev) => [...prev, log]);
          },
          onStatusChange: (newStatus) => {
            setStatus(newStatus);
          },
          onServerReady: (info) => {
            setServerInfo(info);
            setActiveTab("preview");
          },
        });

        return result;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return {
          success: false,
          logs: [],
          error: errorMessage,
          executionTimeMs: Date.now() - lastStartedAt.current,
        };
      }
    },
    [],
  );

  const manualToolCall = useCallback(
    async (
      files: Record<string, string>,
      command: string,
      installDeps: boolean,
    ) => {
      setIsExecuting(true);
      try {
        const result = await runWebContainer(files, command, installDeps);
        onResult?.({
          ...result,
          guide:
            "WebContainer execution finished. Summarize the results: 1) Whether the execution succeeded 2) Any server that started and its URL 3) Key console output 4) Error explanations if any.",
        });
      } finally {
        setIsExecuting(false);
      }
    },
    [runWebContainer, onResult],
  );

  const reExecute = useCallback(async () => {
    if (isExecuting || !input) return;
    setIsExecuting(true);
    setRealtimeLogs([
      {
        type: "system",
        message: "Re-executing WebContainer...",
        timestamp: Date.now(),
      },
    ]);

    safe(() =>
      runWebContainer(input.files, input.command, input.installDeps ?? true),
    ).watch(() => setIsExecuting(false));
  }, [input, isExecuting, runWebContainer]);

  const isRunning = useMemo(() => {
    return isExecuting || part.state.startsWith("input");
  }, [isExecuting, part.state]);

  const scrollToBottom = useCallback(() => {
    codeResultContainerRef.current?.scrollTo({
      top: codeResultContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const logs = useMemo(() => {
    const allLogs = realtimeLogs.length ? realtimeLogs : (result?.logs ?? []);
    const error = result?.error;

    const displayLogs = [...allLogs];
    if (error && !displayLogs.some((l) => l.message === error)) {
      displayLogs.push({
        type: "stderr",
        message: error,
        timestamp: lastStartedAt.current,
      });
    }

    return displayLogs.map((log, i) => (
      <div
        key={i}
        className={cn(
          "flex gap-1 text-muted-foreground pl-3",
          log.type === "stderr" && "text-destructive",
          log.type === "system" && "text-blue-500",
        )}
      >
        <div className="w-[8.6rem] hidden md:block text-[10px]">
          {new Date(log.timestamp).toISOString()}
        </div>
        <div className="h-[15px] flex items-center">
          {log.type === "stderr" ? (
            <AlertTriangleIcon className="size-2" />
          ) : log.type === "system" ? (
            <ServerIcon className="size-2" />
          ) : (
            <ChevronRight className="size-2" />
          )}
        </div>
        <div className="flex-1 min-w-0 whitespace-pre-wrap">
          {log.message}
        </div>
      </div>
    ));
  }, [realtimeLogs, result]);

  const fileList = useMemo(() => {
    if (!input?.files) return [];
    return Object.entries(input.files).map(([path, content]) => ({
      path,
      content,
      lang: path.endsWith(".js")
        ? "javascript"
        : path.endsWith(".ts")
          ? "typescript"
          : path.endsWith(".json")
            ? "json"
            : path.endsWith(".html")
              ? "html"
              : path.endsWith(".css")
                ? "css"
                : "plaintext",
    }));
  }, [input?.files]);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    if (fileList.length > 0 && !selectedFile) {
      setSelectedFile(fileList[0].path);
    }
  }, [fileList, selectedFile]);

  const statusText = useMemo(() => {
    switch (status) {
      case "booting":
        return "Booting WebContainer...";
      case "installing":
        return "Installing dependencies...";
      case "running":
        return "Running command...";
      case "completed":
        return "Completed";
      case "error":
        return "Error";
      default:
        return "Idle";
    }
  }, [status]);

  const header = useMemo(() => {
    if (isRunning) {
      return (
        <>
          <Loader className="size-3 animate-spin text-muted-foreground" />
          <TextShimmer className="text-xs">{statusText}</TextShimmer>
        </>
      );
    }
    return (
      <>
        {result?.error ? (
          <>
            <AlertTriangleIcon className="size-3 text-destructive" />
            <span className="text-destructive text-xs">ERROR</span>
          </>
        ) : (
          <div className="text-[7px] bg-input rounded-xs w-4 h-4 p-0.5 flex items-end justify-end font-bold">
            WC
          </div>
        )}
      </>
    );
  }, [isRunning, result?.error, statusText]);

  useEffect(() => {
    if (
      onResult &&
      input &&
      part.state === "input-available" &&
      !isRun.current
    ) {
      isRun.current = true;
      manualToolCall(input.files, input.command, input.installDeps ?? true);
    }
  }, [part.state, onResult, input, manualToolCall]);

  useEffect(() => {
    if (isRunning) {
      const closeKey = setInterval(scrollToBottom, 300);
      return () => clearInterval(closeKey);
    } else if (part.state.startsWith("output") && isRun.current) {
      scrollToBottom();
    }
  }, [isRunning, part.state, scrollToBottom]);

  const fallback = useMemo(() => <CodeFallback />, []);

  return (
    <div className="flex flex-col">
      <div className="px-6 py-3">
        <div className="border overflow-x-hidden relative rounded-lg shadow fade-in animate-in duration-500">
          {/* Header */}
          <div className="py-2.5 bg-border px-4 flex items-center gap-1.5 z-10 min-h-[37px]">
            {header}
            <div className="flex-1" />

            {serverInfo && (
              <a
                href={serverInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-primary px-2 py-1 transition-all rounded-sm hover:bg-input font-semibold"
              >
                <ExternalLinkIcon className="size-2" />
                Open in New Tab
              </a>
            )}

            {part.state.startsWith("output") && (
              <>
                <div
                  className="flex items-center gap-1 text-[10px] text-muted-foreground px-2 py-1 transition-all rounded-sm cursor-pointer hover:bg-input hover:text-foreground font-semibold"
                  onClick={reExecute}
                >
                  <PlayIcon className="size-2" />
                  Re-run
                </div>
                <div
                  className="flex items-center gap-1 text-[10px] text-muted-foreground px-2 py-1 transition-all rounded-sm cursor-pointer hover:bg-input hover:text-foreground font-semibold"
                  onClick={() => copy(JSON.stringify(input?.files ?? {}, null, 2))}
                >
                  {copied ? (
                    <CheckIcon className="size-2" />
                  ) : (
                    <CopyIcon className="size-2" />
                  )}
                  Copy Files
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "console" | "preview" | "files")}
            className="w-full"
          >
            <div className="px-4 py-2 border-b">
              <TabsList className="h-8">
                <TabsTrigger value="console" className="text-xs h-7">
                  Console
                </TabsTrigger>
                <TabsTrigger value="files" className="text-xs h-7">
                  Files ({fileList.length})
                </TabsTrigger>
                {serverInfo && (
                  <TabsTrigger value="preview" className="text-xs h-7">
                    Preview
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="console" className="mt-0">
              <div
                className="min-h-14 p-4 text-[10px] overflow-y-auto max-h-[40vh]"
                ref={codeResultContainerRef}
              >
                {input?.command && (
                  <div className="text-muted-foreground mb-2">
                    $ {input.command}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {logs.length > 0 ? (
                    logs
                  ) : isRunning ? (
                    fallback
                  ) : (
                    <div className="text-muted-foreground">No output</div>
                  )}
                </div>
                {isRunning && (
                  <div className="ml-3 animate-caret-blink text-muted-foreground">
                    |
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-0">
              <div className="flex h-[300px]">
                {/* File list sidebar */}
                <div className="w-40 border-r overflow-auto bg-muted/20">
                  <div className="p-2 space-y-1">
                    {fileList.map((file) => (
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
                <div className="flex-1 overflow-auto">
                  {selectedFile && fileList.find((f) => f.path === selectedFile) && (
                    <CodeBlock
                      className="p-4 text-[10px]"
                      code={fileList.find((f) => f.path === selectedFile)?.content ?? ""}
                      lang={fileList.find((f) => f.path === selectedFile)?.lang ?? "plaintext"}
                      fallback={fallback}
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            {serverInfo && (
              <TabsContent value="preview" className="mt-0">
                <div className="h-[400px] bg-white">
                  <iframe
                    src={serverInfo.url}
                    className="w-full h-full border-0"
                    title="WebContainer Preview"
                    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Footer status */}
          <div className="p-2 border-t flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              {isRunning ? (
                <Loader className="size-2 animate-spin" />
              ) : (
                <div className="w-1 h-1 ring ring-border rounded-full" />
              )}
              WebContainer
              <Percent className="size-2" />
            </div>
            {result?.executionTimeMs && (
              <span>• {(result.executionTimeMs / 1000).toFixed(2)}s</span>
            )}
            {serverInfo && (
              <span className="text-green-600">• Server running on port {serverInfo.port}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function CodeFallback() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-3 w-1/6" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}
