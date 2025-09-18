import { create } from 'zustand';
import type { AppState, FileNode } from '../types';

interface AppStore extends AppState {
  setCurrentFile: (file: FileNode | null) => void;
  togglePreviewMode: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSearchQuery: (query: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  addFile: (parentPath: string, name: string, type: 'file' | 'folder') => void;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  toggleFolder: (folderId: string) => void;
}

// 初始示例数据
const initialFiles: FileNode[] = [
  {
    id: '1',
    name: 'Welcome.md',
    type: 'file',
    path: '/Welcome.md',
    content: '# Welcome to Obsidian Web\n\nThis is a web-based Obsidian clone built with React and TypeScript.\n\n## Features\n\n- Markdown editing\n- File management\n- Live preview\n- Search functionality\n- Dark/Light themes',
    lastModified: new Date(),
  },
  {
    id: '2',
    name: 'Notes',
    type: 'folder',
    path: '/Notes',
    isExpanded: true,
    lastModified: new Date(),
    children: [
      {
        id: '3',
        name: 'Daily Notes.md',
        type: 'file',
        path: '/Notes/Daily Notes.md',
        content: '# Daily Notes\n\n## Today\'s Tasks\n\n- [ ] Review project structure\n- [ ] Implement editor features\n- [x] Set up basic layout',
        lastModified: new Date(),
      },
    ],
  },
];

export const useAppStore = create<AppStore>((set) => ({
  files: initialFiles,
  currentFile: initialFiles[0],
  isPreviewMode: false,
  theme: 'dark',
  searchQuery: '',

  setCurrentFile: (file) => set({ currentFile: file }),
  
  togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
  
  setTheme: (theme) => set({ theme }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  updateFileContent: (fileId, content) => {
    const updateFileInTree = (files: FileNode[]): FileNode[] => {
      return files.map(file => {
        if (file.id === fileId) {
          return { ...file, content, lastModified: new Date() };
        }
        if (file.children) {
          return { ...file, children: updateFileInTree(file.children) };
        }
        return file;
      });
    };
    
    set((state) => {
      const newFiles = updateFileInTree(state.files);
      const newCurrentFile = state.currentFile?.id === fileId 
        ? { ...state.currentFile, content, lastModified: new Date() }
        : state.currentFile;
      return { files: newFiles, currentFile: newCurrentFile };
    });
  },

  addFile: (parentPath, name, type) => {
    const newFile: FileNode = {
      id: Date.now().toString(),
      name,
      type,
      path: `${parentPath}/${name}`,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined,
      isExpanded: type === 'folder' ? false : undefined,
      lastModified: new Date(),
    };

    const addToTree = (files: FileNode[]): FileNode[] => {
      return files.map(file => {
        if (file.path === parentPath && file.type === 'folder') {
          return {
            ...file,
            children: [...(file.children || []), newFile],
            isExpanded: true,
          };
        }
        if (file.children) {
          return { ...file, children: addToTree(file.children) };
        }
        return file;
      });
    };

    if (parentPath === '/') {
      set((state) => ({ files: [...state.files, newFile] }));
    } else {
      set((state) => ({ files: addToTree(state.files) }));
    }
  },

  deleteFile: (fileId) => {
    const deleteFromTree = (files: FileNode[]): FileNode[] => {
      return files.filter(file => {
        if (file.id === fileId) return false;
        if (file.children) {
          file.children = deleteFromTree(file.children);
        }
        return true;
      });
    };

    set((state) => {
      const newFiles = deleteFromTree(state.files);
      const newCurrentFile = state.currentFile?.id === fileId ? null : state.currentFile;
      return { files: newFiles, currentFile: newCurrentFile };
    });
  },

  renameFile: (fileId, newName) => {
    const renameInTree = (files: FileNode[]): FileNode[] => {
      return files.map(file => {
        if (file.id === fileId) {
          const pathParts = file.path.split('/');
          pathParts[pathParts.length - 1] = newName;
          return { ...file, name: newName, path: pathParts.join('/') };
        }
        if (file.children) {
          return { ...file, children: renameInTree(file.children) };
        }
        return file;
      });
    };

    set((state) => {
      const newFiles = renameInTree(state.files);
      const newCurrentFile = state.currentFile?.id === fileId 
        ? { ...state.currentFile, name: newName }
        : state.currentFile;
      return { files: newFiles, currentFile: newCurrentFile };
    });
  },

  toggleFolder: (folderId) => {
    const toggleInTree = (files: FileNode[]): FileNode[] => {
      return files.map(file => {
        if (file.id === folderId && file.type === 'folder') {
          return { ...file, isExpanded: !file.isExpanded };
        }
        if (file.children) {
          return { ...file, children: toggleInTree(file.children) };
        }
        return file;
      });
    };

    set((state) => ({ files: toggleInTree(state.files) }));
  },
}));