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

// 标签页接口
export interface Tab {
  id: string;
  fileId: string;
  title: string;
  path: string;
  isActive: boolean;
  isDirty: boolean; // 文件是否有未保存的更改
  isPinned: boolean; // 是否固定标签
}

// 标签组接口
export interface TabGroup {
  id: string;
  tabs: Tab[];
  activeTabId: string | null;
  direction: 'horizontal' | 'vertical'; // 分割方向
  size: number; // 占用空间比例 (0-1)
}

// 工作区布局接口
export interface WorkspaceLayout {
  groups: TabGroup[];
  activeGroupId: string | null;
  splitDirection: 'horizontal' | 'vertical';
}

export interface AppState {
  files: FileNode[];
  currentFile: FileNode | null;
  isPreviewMode: boolean;
  theme: 'light' | 'dark';
  searchQuery: string;
  // 新增标签管理状态
  workspace: WorkspaceLayout;
  openTabs: { [fileId: string]: Tab }; // 所有打开的标签页映射
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