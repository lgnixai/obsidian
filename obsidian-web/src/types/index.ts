export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  isExpanded?: boolean;
  lastModified: Date;
}

export interface AppState {
  files: FileNode[];
  currentFile: FileNode | null;
  isPreviewMode: boolean;
  theme: 'light' | 'dark';
  searchQuery: string;
}

export interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  language?: string;
}

export interface SidebarProps {
  files: FileNode[];
  currentFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
  onFileCreate: (parentPath: string, name: string, type: 'file' | 'folder') => void;
  onFileDelete: (file: FileNode) => void;
  onFileRename: (file: FileNode, newName: string) => void;
}