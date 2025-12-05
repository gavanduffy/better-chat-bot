
import {
  ChevronRight,
  ChevronDown,
  FileIcon,
  FolderIcon,
  FileCodeIcon,
  FileJsonIcon,
  FileImageIcon,
  FileTextIcon
} from "lucide-react";
import { useState, type MouseEvent } from "react";
import { cn } from "lib/utils";
import { VirtualFile, FileTreeNode } from "lib/artifact/virtual-fs";

interface FileTreeProps {
  root: FileTreeNode;
  selectedPath: string;
  onSelectFile: (path: string) => void;
  className?: string;
}

const FileIconComponent = ({ type, name }: { type: string, name: string }) => {
  const ext = name.split('.').pop()?.toLowerCase();

  if (type === "folder") return <FolderIcon className="size-3.5 text-blue-400" />;

  switch(ext) {
    case 'html': return <FileCodeIcon className="size-3.5 text-orange-400" />;
    case 'css': return <FileCodeIcon className="size-3.5 text-blue-300" />;
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx': return <FileCodeIcon className="size-3.5 text-yellow-400" />;
    case 'json': return <FileJsonIcon className="size-3.5 text-yellow-300" />;
    case 'md':
    case 'txt': return <FileTextIcon className="size-3.5 text-gray-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'svg': return <FileImageIcon className="size-3.5 text-purple-400" />;
    default: return <FileIcon className="size-3.5 text-gray-400" />;
  }
};

const FileTreeNodeComponent = ({
  node,
  level,
  selectedPath,
  onSelectFile
}: {
  node: FileTreeNode;
  level: number;
  selectedPath: string;
  onSelectFile: (path: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = node.path === selectedPath;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (node.type === "folder") {
      setIsExpanded(!isExpanded);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 py-1 px-2 rounded-sm cursor-pointer hover:bg-muted/50 text-xs select-none transition-colors",
          isSelected && "bg-accent text-accent-foreground font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="opacity-70 flex-shrink-0">
           {node.type === "folder" && (
             isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />
           )}
           {node.type === "file" && <span className="w-3" />}
        </span>

        <FileIconComponent type={node.type} name={node.name} />
        <span className="truncate">{node.name}</span>
      </div>

      {node.type === "folder" && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNodeComponent
              key={child.path}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function FileTree({ root, selectedPath, onSelectFile, className }: FileTreeProps) {
  return (
    <div className={cn("overflow-auto py-2", className)}>
      {root.children?.map((child) => (
        <FileTreeNodeComponent
          key={child.path}
          node={child}
          level={0}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}
