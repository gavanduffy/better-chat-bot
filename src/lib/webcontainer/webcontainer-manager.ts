"use client";

import { WebContainer, FileSystemTree } from "@webcontainer/api";
import {
  WebContainerExecutionOptions,
  WebContainerResult,
  WebContainerLogEntry,
  WebContainerStatus,
  WebContainerServerInfo,
} from "./types";

/** Singleton WebContainer instance manager */
class WebContainerManager {
  private static instance: WebContainerManager;
  private webcontainerInstance: WebContainer | null = null;
  private bootPromise: Promise<WebContainer> | null = null;

  private constructor() {}

  /** Get the singleton instance */
  static getInstance(): WebContainerManager {
    if (!WebContainerManager.instance) {
      WebContainerManager.instance = new WebContainerManager();
    }
    return WebContainerManager.instance;
  }

  /** Boot or get the existing WebContainer instance */
  async boot(): Promise<WebContainer> {
    if (this.webcontainerInstance) {
      return this.webcontainerInstance;
    }

    if (this.bootPromise) {
      return this.bootPromise;
    }

    this.bootPromise = WebContainer.boot().then((instance) => {
      this.webcontainerInstance = instance;
      return instance;
    });

    return this.bootPromise;
  }

  /** Convert flat file record to WebContainer FileSystemTree */
  private buildFileTree(files: Record<string, string>): FileSystemTree {
    const tree: FileSystemTree = {};

    for (const [path, contents] of Object.entries(files)) {
      const parts = path.split("/").filter(Boolean);
      let current: FileSystemTree = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLastPart = i === parts.length - 1;

        if (isLastPart) {
          current[part] = {
            file: { contents },
          };
        } else {
          const existing = current[part];
          // Check if entry exists and is a directory
          if (!existing) {
            current[part] = {
              directory: {},
            };
          } else if (!("directory" in existing)) {
            // Entry exists but is not a directory, skip this path
            break;
          }
          current = (current[part] as { directory: FileSystemTree }).directory;
        }
      }
    }

    return tree;
  }

  /** Mount files to the WebContainer */
  async mountFiles(files: Record<string, string>): Promise<void> {
    const instance = await this.boot();
    const tree = this.buildFileTree(files);
    await instance.mount(tree);
  }

  /** Run npm install */
  async install(
    onLog?: (log: WebContainerLogEntry) => void,
  ): Promise<{ success: boolean; exitCode: number }> {
    const instance = await this.boot();
    
    try {
      const installProcess = await instance.spawn("npm", ["install"]);

      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            onLog?.({
              type: "stdout",
              message: data,
              timestamp: Date.now(),
            });
          },
        }),
      );

      const exitCode = await installProcess.exit;
      return { success: exitCode === 0, exitCode };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "npm install failed";
      onLog?.({
        type: "stderr",
        message,
        timestamp: Date.now(),
      });
      return { success: false, exitCode: 1 };
    }
  }

  /** Run a command in the WebContainer */
  async spawn(
    command: string,
    args: string[],
    onLog?: (log: WebContainerLogEntry) => void,
  ): Promise<{ success: boolean; exitCode: number }> {
    const instance = await this.boot();
    const process = await instance.spawn(command, args);

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          onLog?.({
            type: "stdout",
            message: data,
            timestamp: Date.now(),
          });
        },
      }),
    );

    const exitCode = await process.exit;
    return { success: exitCode === 0, exitCode };
  }

  /** Listen for server-ready events */
  onServerReady(callback: (info: WebContainerServerInfo) => void): void {
    this.boot().then((instance) => {
      instance.on("server-ready", (port, url) => {
        callback({ port, url });
      });
    });
  }

  /** Execute a complete project with optional npm install and command */
  async execute(options: WebContainerExecutionOptions): Promise<WebContainerResult> {
    const {
      files,
      command,
      installDeps = true,
      packageJson,
      timeout = 60000,
      onLog,
      onStatusChange,
      onServerReady,
    } = options;

    const startTime = Date.now();
    const logs: WebContainerLogEntry[] = [];
    let serverInfo: WebContainerServerInfo | undefined;
    let status: WebContainerStatus = "idle";

    const updateStatus = (newStatus: WebContainerStatus) => {
      status = newStatus;
      onStatusChange?.(status);
    };

    const addLog = (log: WebContainerLogEntry) => {
      logs.push(log);
      onLog?.(log);
    };

    try {
      // Boot WebContainer
      updateStatus("booting");
      addLog({
        type: "system",
        message: "Booting WebContainer...",
        timestamp: Date.now(),
      });

      await this.boot();

      // Prepare files
      const allFiles = { ...files };

      // Add package.json if provided or if installDeps is true
      if (packageJson || installDeps) {
        // Only add default start script if not already provided
        const defaultStart = command.startsWith("node") ? command : undefined;
        const pkgJson = {
          name: "webcontainer-project",
          type: "module",
          ...packageJson,
          dependencies: packageJson?.dependencies || {},
          scripts: {
            ...(defaultStart ? { start: defaultStart } : {}),
            ...packageJson?.scripts,
          },
        };
        allFiles["package.json"] = JSON.stringify(pkgJson, null, 2);
      }

      // Mount files
      addLog({
        type: "system",
        message: "Mounting files...",
        timestamp: Date.now(),
      });
      await this.mountFiles(allFiles);

      // Install dependencies
      if (installDeps && (packageJson?.dependencies || allFiles["package.json"])) {
        updateStatus("installing");
        addLog({
          type: "system",
          message: "Installing dependencies...",
          timestamp: Date.now(),
        });

        const installResult = await this.install(addLog);
        if (!installResult.success) {
          return {
            success: false,
            exitCode: installResult.exitCode,
            logs,
            error: "npm install failed",
            executionTimeMs: Date.now() - startTime,
          };
        }
      }

      // Listen for server-ready events
      if (onServerReady) {
        this.onServerReady((info) => {
          serverInfo = info;
          onServerReady(info);
        });
      }

      // Run the command
      updateStatus("running");
      addLog({
        type: "system",
        message: `Running: ${command}`,
        timestamp: Date.now(),
      });

      const [cmd, ...args] = command.split(" ");
      const instance = await this.boot();
      const process = await instance.spawn(cmd, args);

      // Set up output streaming
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            addLog({
              type: "stdout",
              message: data,
              timestamp: Date.now(),
            });
          },
        }),
      );

      // Wait for process to complete with timeout
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const exitCode = await Promise.race([
        process.exit.then((code) => {
          if (timeoutId) clearTimeout(timeoutId);
          return code;
        }),
        new Promise<number>((_, reject) => {
          timeoutId = setTimeout(() => {
            process.kill();
            reject(new Error(`Execution timeout: ${timeout}ms exceeded`));
          }, timeout);
        }),
      ]);

      updateStatus("completed");
      return {
        success: exitCode === 0,
        exitCode,
        logs,
        serverInfo,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      updateStatus("error");
      addLog({
        type: "stderr",
        message: errorMessage,
        timestamp: Date.now(),
      });

      return {
        success: false,
        logs,
        error: errorMessage,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  /** Teardown the WebContainer (for cleanup) */
  async teardown(): Promise<void> {
    if (this.webcontainerInstance) {
      this.webcontainerInstance.teardown();
      this.webcontainerInstance = null;
      this.bootPromise = null;
    }
  }
}

/** Get the WebContainer manager instance */
export function getWebContainerManager(): WebContainerManager {
  return WebContainerManager.getInstance();
}

/** Execute a WebContainer project */
export async function executeWebContainer(
  options: WebContainerExecutionOptions,
): Promise<WebContainerResult> {
  const manager = getWebContainerManager();
  return manager.execute(options);
}
