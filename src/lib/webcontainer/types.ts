/**
 * WebContainer types and interfaces
 */

/** Status of the WebContainer execution */
export type WebContainerStatus =
  | "idle"
  | "booting"
  | "installing"
  | "running"
  | "completed"
  | "error";

/** Log entry from WebContainer execution */
export interface WebContainerLogEntry {
  type: "stdout" | "stderr" | "system";
  message: string;
  timestamp: number;
}

/** Server information when a server starts in WebContainer */
export interface WebContainerServerInfo {
  url: string;
  port: number;
}

/** Result of WebContainer execution */
export interface WebContainerResult {
  success: boolean;
  exitCode?: number;
  logs: WebContainerLogEntry[];
  serverInfo?: WebContainerServerInfo;
  error?: string;
  executionTimeMs: number;
}

/** Options for WebContainer execution */
export interface WebContainerExecutionOptions {
  files: Record<string, string>;
  command: string;
  installDeps?: boolean;
  packageJson?: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  };
  timeout?: number;
  onLog?: (log: WebContainerLogEntry) => void;
  onStatusChange?: (status: WebContainerStatus) => void;
  onServerReady?: (info: WebContainerServerInfo) => void;
}

/** File tree structure for mounting files */
export interface FileTree {
  [path: string]:
    | string
    | {
        file: { contents: string };
      }
    | {
        directory: FileTree;
      };
}
