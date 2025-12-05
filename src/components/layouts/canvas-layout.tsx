"use client";

import { cn } from "lib/utils";
import { memo, ReactNode, useState, useCallback } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "ui/button";

interface CanvasLayoutProps {
  children: ReactNode;
  canvasContent?: ReactNode;
  isCanvasOpen?: boolean;
  onCanvasClose?: () => void;
  canvasTitle?: string;
  className?: string;
}

/**
 * CanvasLayout provides a split-pane workspace:
 * - Left Pane (Chat): Context, instructions, and quick questions
 * - Right Pane (Canvas): Persistent, interactive view for artifacts
 *
 * The layout automatically opens the Canvas when artifact content is detected.
 */
export const CanvasLayout = memo(function CanvasLayout({
  children,
  canvasContent,
  isCanvasOpen = false,
  onCanvasClose,
  canvasTitle = "Canvas",
  className,
}: CanvasLayoutProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleToggleMaximize = useCallback(() => {
    setIsMaximized((prev) => !prev);
  }, []);

  // If canvas is not open, render only the chat
  if (!isCanvasOpen || !canvasContent) {
    return <div className={cn("h-full w-full", className)}>{children}</div>;
  }

  // Maximized canvas view
  if (isMaximized) {
    return (
      <div className={cn("h-full w-full relative", className)}>
        <div className="absolute top-0 left-0 right-0 h-12 bg-background border-b flex items-center justify-between px-4 z-10">
          <span className="font-medium text-sm">{canvasTitle}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleToggleMaximize}
              title="Exit fullscreen"
            >
              <Minimize2 className="size-4" />
            </Button>
            {onCanvasClose && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={onCanvasClose}
                title="Close canvas"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="h-full pt-12">{canvasContent}</div>
      </div>
    );
  }

  // Split-pane view
  return (
    <div className={cn("h-full w-full", className)}>
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Pane: Chat */}
        <Panel defaultSize={50} minSize={30} className="h-full">
          {children}
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/20 transition-colors cursor-col-resize" />

        {/* Right Pane: Canvas */}
        <Panel defaultSize={50} minSize={25} className="h-full">
          <div className="h-full flex flex-col bg-muted/20">
            {/* Canvas Header */}
            <div className="h-12 border-b flex items-center justify-between px-4 bg-background">
              <span className="font-medium text-sm">{canvasTitle}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={handleToggleMaximize}
                  title="Maximize"
                >
                  <Maximize2 className="size-4" />
                </Button>
                {onCanvasClose && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={onCanvasClose}
                    title="Close canvas"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Canvas Content */}
            <div className="flex-1 overflow-auto p-4">{canvasContent}</div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
});

CanvasLayout.displayName = "CanvasLayout";

export default CanvasLayout;
