import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { AppState, FileNode, Tab, TabGroup, WorkspaceLayout } from '../types';
import { storage, createDebouncedSave } from '../utils/storage';

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
  
  // 标签管理方法
  openFileInTab: (file: FileNode, groupId?: string) => void;
  closeTab: (tabId: string) => void;
  switchToTab: (tabId: string) => void;
  moveTab: (tabId: string, targetGroupId: string, targetIndex?: number) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  createTabGroup: (direction: 'horizontal' | 'vertical', sourceGroupId?: string) => string;
  closeTabGroup: (groupId: string) => void;
  setActiveTabGroup: (groupId: string) => void;
  splitTabGroup: (groupId: string, direction: 'horizontal' | 'vertical', tabId?: string) => void;
  reorderTabs: (groupId: string, oldIndex: number, newIndex: number) => void;
  duplicateTab: (tabId: string) => void;
  // 标签导航
  switchToNextTab: () => void;
  switchToPrevTab: () => void;
  closeCurrentTab: () => void;
  createNewTab: () => void;
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

// 创建初始工作区布局
const createInitialWorkspace = (): WorkspaceLayout => {
  const initialTabId = 'tab-1';
  const initialGroupId = 'group-1';
  
  const initialTab: Tab = {
    id: initialTabId,
    fileId: '1',
    title: 'Welcome.md',
    path: '/Welcome.md',
    isActive: true,
    isDirty: false,
    isPinned: false,
  };

  const initialGroup: TabGroup = {
    id: initialGroupId,
    tabs: [initialTab],
    activeTabId: initialTabId,
    direction: 'horizontal',
    size: 1,
  };

  return {
    groups: [initialGroup],
    activeGroupId: initialGroupId,
    splitDirection: 'horizontal',
  };
};

// 加载持久化状态
const loadPersistedState = () => {
  const savedWorkspace = storage.loadWorkspace();
  const savedTabs = storage.loadTabs();
  const savedTheme = storage.loadTheme();

  return {
    workspace: savedWorkspace || createInitialWorkspace(),
    openTabs: savedTabs || {
      '1': {
        id: 'tab-1',
        fileId: '1',
        title: 'Welcome.md',
        path: '/Welcome.md',
        isActive: true,
        isDirty: false,
        isPinned: false,
      }
    },
    theme: savedTheme || 'dark',
  };
};

// 创建防抖保存函数
const debouncedSaveWorkspace = createDebouncedSave(storage.saveWorkspace, 300);
const debouncedSaveTabs = createDebouncedSave(storage.saveTabs, 300);

export const useAppStore = create(
  subscribeWithSelector<AppStore>((set, get) => {
    const persistedState = loadPersistedState();
    
    return {
      files: initialFiles,
      currentFile: initialFiles[0],
      isPreviewMode: false,
      searchQuery: '',
      ...persistedState,

  setCurrentFile: (file) => {
    if (file) {
      // 如果文件已经在某个标签中打开，切换到该标签
      const existingTab = Object.values(get().openTabs).find(tab => tab.fileId === file.id);
      if (existingTab) {
        get().switchToTab(existingTab.id);
      } else {
        // 否则在当前活动组中打开新标签
        get().openFileInTab(file);
      }
    } else {
      set({ currentFile: file });
    }
  },
  
  togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
  
  setTheme: (theme) => {
    set({ theme });
    storage.saveTheme(theme);
  },
  
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

  // === 标签管理方法实现 ===
  
  openFileInTab: (file, groupId) => {
    set((state) => {
      const targetGroupId = groupId || state.workspace.activeGroupId || state.workspace.groups[0]?.id;
      if (!targetGroupId) return state;

      // 检查文件是否已经在标签中打开
      const existingTab = Object.values(state.openTabs).find(tab => tab.fileId === file.id);
      if (existingTab) {
        // 如果已经打开，直接切换到该标签
        get().switchToTab(existingTab.id);
        return state;
      }

      // 创建新标签
      const newTabId = `tab-${Date.now()}`;
      const newTab: Tab = {
        id: newTabId,
        fileId: file.id,
        title: file.name,
        path: file.path,
        isActive: true,
        isDirty: false,
        isPinned: false,
      };

      // 更新工作区
      const newGroups = state.workspace.groups.map(group => {
        if (group.id === targetGroupId) {
          // 将其他标签设为非活动状态
          const updatedTabs = group.tabs.map(tab => ({ ...tab, isActive: false }));
          return {
            ...group,
            tabs: [...updatedTabs, newTab],
            activeTabId: newTabId,
          };
        }
        return group;
      });

      return {
        ...state,
        currentFile: file,
        openTabs: { ...state.openTabs, [file.id]: newTab },
        workspace: {
          ...state.workspace,
          groups: newGroups,
          activeGroupId: targetGroupId,
        },
      };
    });
  },

  closeTab: (tabId) => {
    set((state) => {
      const tab = Object.values(state.openTabs).find(t => t.id === tabId);
      if (!tab) return state;

      // 从 openTabs 中移除
      const { [tab.fileId]: removedTab, ...remainingTabs } = state.openTabs;

      // 从工作区中移除标签
      let newCurrentFile = state.currentFile;
      const newGroups = state.workspace.groups.map(group => {
        const tabIndex = group.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return group;

        const newTabs = group.tabs.filter(t => t.id !== tabId);
        
        // 如果关闭的是活动标签，需要选择新的活动标签
        let newActiveTabId = group.activeTabId;
        if (group.activeTabId === tabId) {
          if (newTabs.length > 0) {
            // 选择相邻的标签作为新的活动标签
            const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
            newActiveTabId = newTabs[newActiveIndex]?.id || null;
            
            // 更新当前文件
            if (newActiveTabId) {
              const newActiveTab = newTabs[newActiveIndex];
              const file = state.files.find(f => f.id === newActiveTab.fileId);
              if (file) newCurrentFile = file;
            }
          } else {
            newActiveTabId = null;
            newCurrentFile = null;
          }
        }

        return {
          ...group,
          tabs: newTabs,
          activeTabId: newActiveTabId,
        };
      }).filter(group => group.tabs.length > 0); // 移除空的标签组

      return {
        ...state,
        currentFile: newCurrentFile,
        openTabs: remainingTabs,
        workspace: {
          ...state.workspace,
          groups: newGroups,
          activeGroupId: newGroups.length > 0 ? newGroups[0].id : null,
        },
      };
    });
  },

  switchToTab: (tabId) => {
    set((state) => {
      const tab = Object.values(state.openTabs).find(t => t.id === tabId);
      if (!tab) return state;

      const file = state.files.find(f => f.id === tab.fileId);
      if (!file) return state;

      // 更新工作区状态
      const newGroups = state.workspace.groups.map(group => {
        const hasTab = group.tabs.some(t => t.id === tabId);
        if (!hasTab) return group;

        return {
          ...group,
          tabs: group.tabs.map(t => ({ ...t, isActive: t.id === tabId })),
          activeTabId: tabId,
        };
      });

      // 找到包含该标签的组
      const activeGroup = newGroups.find(group => group.tabs.some(t => t.id === tabId));

      return {
        ...state,
        currentFile: file,
        workspace: {
          ...state.workspace,
          groups: newGroups,
          activeGroupId: activeGroup?.id || state.workspace.activeGroupId,
        },
      };
    });
  },

  moveTab: (tabId, targetGroupId, targetIndex) => {
    set((state) => {
      const tab = Object.values(state.openTabs).find(t => t.id === tabId);
      if (!tab) return state;

      let sourceGroup: TabGroup | null = null;
      let targetGroup: TabGroup | null = null;

      // 找到源组和目标组
      for (const group of state.workspace.groups) {
        if (group.tabs.some(t => t.id === tabId)) {
          sourceGroup = group;
        }
        if (group.id === targetGroupId) {
          targetGroup = group;
        }
      }

      if (!sourceGroup || !targetGroup) return state;

      const newGroups = state.workspace.groups.map(group => {
        if (group.id === sourceGroup!.id) {
          // 从源组移除标签
          const newTabs = group.tabs.filter(t => t.id !== tabId);
          return {
            ...group,
            tabs: newTabs,
            activeTabId: newTabs.length > 0 ? newTabs[0].id : null,
          };
        }
        
        if (group.id === targetGroupId) {
          // 添加到目标组
          const newTabs = [...group.tabs];
          const insertIndex = targetIndex !== undefined ? targetIndex : newTabs.length;
          newTabs.splice(insertIndex, 0, { ...tab, isActive: true });
          
          // 将其他标签设为非活动状态
          const updatedTabs = newTabs.map(t => ({ ...t, isActive: t.id === tabId }));
          
          return {
            ...group,
            tabs: updatedTabs,
            activeTabId: tabId,
          };
        }
        
        return group;
      }).filter(group => group.tabs.length > 0);

      return {
        ...state,
        workspace: {
          ...state.workspace,
          groups: newGroups,
          activeGroupId: targetGroupId,
        },
      };
    });
  },

  pinTab: (tabId) => {
    set((state) => {
      const newOpenTabs = { ...state.openTabs };
      Object.keys(newOpenTabs).forEach(fileId => {
        if (newOpenTabs[fileId].id === tabId) {
          newOpenTabs[fileId] = { ...newOpenTabs[fileId], isPinned: true };
        }
      });

      const newGroups = state.workspace.groups.map(group => ({
        ...group,
        tabs: group.tabs.map(tab => 
          tab.id === tabId ? { ...tab, isPinned: true } : tab
        ),
      }));

      return {
        ...state,
        openTabs: newOpenTabs,
        workspace: { ...state.workspace, groups: newGroups },
      };
    });
  },

  unpinTab: (tabId) => {
    set((state) => {
      const newOpenTabs = { ...state.openTabs };
      Object.keys(newOpenTabs).forEach(fileId => {
        if (newOpenTabs[fileId].id === tabId) {
          newOpenTabs[fileId] = { ...newOpenTabs[fileId], isPinned: false };
        }
      });

      const newGroups = state.workspace.groups.map(group => ({
        ...group,
        tabs: group.tabs.map(tab => 
          tab.id === tabId ? { ...tab, isPinned: false } : tab
        ),
      }));

      return {
        ...state,
        openTabs: newOpenTabs,
        workspace: { ...state.workspace, groups: newGroups },
      };
    });
  },

  createTabGroup: (direction, sourceGroupId) => {
    const newGroupId = `group-${Date.now()}`;
    
    set((state) => {
      const newGroup: TabGroup = {
        id: newGroupId,
        tabs: [],
        activeTabId: null,
        direction,
        size: 0.5,
      };

      // 如果有源组，调整其大小
      const newGroups = sourceGroupId 
        ? state.workspace.groups.map(group => 
            group.id === sourceGroupId 
              ? { ...group, size: 0.5 }
              : group
          ).concat(newGroup)
        : [...state.workspace.groups, newGroup];

      return {
        ...state,
        workspace: {
          ...state.workspace,
          groups: newGroups,
          activeGroupId: newGroupId,
        },
      };
    });

    return newGroupId;
  },

  closeTabGroup: (groupId) => {
    set((state) => {
      const groupToClose = state.workspace.groups.find(g => g.id === groupId);
      if (!groupToClose) return state;

      // 关闭该组中的所有标签
      const tabsToClose = groupToClose.tabs;
      let newOpenTabs = { ...state.openTabs };
      
      tabsToClose.forEach(tab => {
        delete newOpenTabs[tab.fileId];
      });

      const newGroups = state.workspace.groups.filter(g => g.id !== groupId);
      
      return {
        ...state,
        openTabs: newOpenTabs,
        workspace: {
          ...state.workspace,
          groups: newGroups,
          activeGroupId: newGroups.length > 0 ? newGroups[0].id : null,
        },
        currentFile: newGroups.length > 0 ? state.currentFile : null,
      };
    });
  },

  setActiveTabGroup: (groupId) => {
    set((state) => ({
      ...state,
      workspace: { ...state.workspace, activeGroupId: groupId },
    }));
  },

  splitTabGroup: (groupId, direction, tabId) => {
    const newGroupId = get().createTabGroup(direction, groupId);
    
    if (tabId) {
      // 将指定标签移动到新组
      get().moveTab(tabId, newGroupId);
    }
  },

  reorderTabs: (groupId, oldIndex, newIndex) => {
    set((state) => {
      const newGroups = state.workspace.groups.map(group => {
        if (group.id !== groupId) return group;

        const newTabs = [...group.tabs];
        const [movedTab] = newTabs.splice(oldIndex, 1);
        newTabs.splice(newIndex, 0, movedTab);

        return { ...group, tabs: newTabs };
      });

      return {
        ...state,
        workspace: { ...state.workspace, groups: newGroups },
      };
    });
  },

  duplicateTab: (tabId) => {
    set((state) => {
      const tab = Object.values(state.openTabs).find(t => t.id === tabId);
      if (!tab) return state;

      const file = state.files.find(f => f.id === tab.fileId);
      if (!file) return state;

      // 在同一组中打开文件的副本
      const group = state.workspace.groups.find(g => g.tabs.some(t => t.id === tabId));
      if (group) {
        get().openFileInTab(file, group.id);
      }

      return state;
    });
  },

  // === 标签导航方法 ===
  switchToNextTab: () => {
    const state = get();
    const activeGroup = state.workspace.groups.find(g => g.id === state.workspace.activeGroupId);
    if (!activeGroup || activeGroup.tabs.length <= 1) return;

    const currentIndex = activeGroup.tabs.findIndex(t => t.isActive);
    const nextIndex = (currentIndex + 1) % activeGroup.tabs.length;
    const nextTab = activeGroup.tabs[nextIndex];
    
    if (nextTab) {
      get().switchToTab(nextTab.id);
    }
  },

  switchToPrevTab: () => {
    const state = get();
    const activeGroup = state.workspace.groups.find(g => g.id === state.workspace.activeGroupId);
    if (!activeGroup || activeGroup.tabs.length <= 1) return;

    const currentIndex = activeGroup.tabs.findIndex(t => t.isActive);
    const prevIndex = currentIndex === 0 ? activeGroup.tabs.length - 1 : currentIndex - 1;
    const prevTab = activeGroup.tabs[prevIndex];
    
    if (prevTab) {
      get().switchToTab(prevTab.id);
    }
  },

  closeCurrentTab: () => {
    const state = get();
    const activeGroup = state.workspace.groups.find(g => g.id === state.workspace.activeGroupId);
    if (!activeGroup) return;

    const activeTab = activeGroup.tabs.find(t => t.isActive);
    if (activeTab) {
      get().closeTab(activeTab.id);
    }
  },

  createNewTab: () => {
    const state = get();
    const activeGroupId = state.workspace.activeGroupId;
    if (!activeGroupId) return;

    // 创建新的空文件
    const newFileName = `Untitled-${Date.now()}.md`;
    const newFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      type: 'file' as const,
      path: `/${newFileName}`,
      content: '',
      lastModified: new Date(),
    };
    
    get().openFileInTab(newFile, activeGroupId);
  },
    };
  })
);

// 订阅状态变化以自动保存
useAppStore.subscribe(
  (state) => debouncedSaveWorkspace(state.workspace)
);

useAppStore.subscribe(
  (state) => debouncedSaveTabs(state.openTabs)
);