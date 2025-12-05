
export interface VirtualFile {
  path: string;
  content: string;
  type: string;
  encoding?: "utf-8" | "base64";
  mimeType?: string;
  isFolder?: boolean;
}

export class VirtualFileSystem {
  private files: Map<string, VirtualFile> = new Map();

  constructor(initialFiles: VirtualFile[] = []) {
    initialFiles.forEach((file) => {
      this.files.set(this.normalizePath(file.path), file);
    });
  }

  /**
   * Normalize a file path, resolving . and .. segments
   */
  normalizePath(path: string): string {
    // Remove leading slash
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const parts = cleanPath.split("/");
    const stack: string[] = [];

    for (const part of parts) {
      if (part === "" || part === ".") {
        continue;
      }
      if (part === "..") {
        if (stack.length > 0) {
          stack.pop();
        }
      } else {
        stack.push(part);
      }
    }

    return stack.join("/");
  }

  /**
   * Resolve a relative path against a base path
   */
  resolvePath(basePath: string, relativePath: string): string {
    // If relative path is absolute (starts with /), treat it as relative to root
    if (relativePath.startsWith("/")) {
      return this.normalizePath(relativePath);
    }

    const baseDir = basePath.includes("/")
      ? basePath.substring(0, basePath.lastIndexOf("/"))
      : "";

    const combined = baseDir ? `${baseDir}/${relativePath}` : relativePath;
    return this.normalizePath(combined);
  }

  writeFile(file: VirtualFile): void {
    const path = this.normalizePath(file.path);
    this.files.set(path, { ...file, path });
  }

  readFile(path: string): VirtualFile | undefined {
    return this.files.get(this.normalizePath(path));
  }

  deleteFile(path: string): boolean {
    return this.files.delete(this.normalizePath(path));
  }

  exists(path: string): boolean {
    return this.files.has(this.normalizePath(path));
  }

  getAllFiles(): VirtualFile[] {
    return Array.from(this.files.values()).sort((a, b) =>
      a.path.localeCompare(b.path)
    );
  }

  /**
   * Get file tree structure
   */
  getFileTree(): FileTreeNode {
    const root: FileTreeNode = {
      name: "root",
      path: "",
      type: "folder",
      children: [],
    };

    const files = this.getAllFiles();

    for (const file of files) {
      const parts = file.path.split("/");
      let current = root;
      let currentPath = "";

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        // Check if this part is a file (last part and not marked as folder)
        const isFile = i === parts.length - 1 && !file.isFolder;

        let child = current.children?.find((c) => c.name === part);

        if (!child) {
          child = {
            name: part,
            path: currentPath,
            type: isFile ? "file" : "folder",
            file: isFile ? file : undefined,
            children: isFile ? undefined : [],
          };
          current.children?.push(child);
          // Sort children: folders first, then files, alphabetical
          current.children?.sort((a, b) => {
             if (a.type === b.type) return a.name.localeCompare(b.name);
             return a.type === "folder" ? -1 : 1;
          });
        }

        current = child;
      }
    }

    return root;
  }
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  file?: VirtualFile;
  children?: FileTreeNode[];
}
