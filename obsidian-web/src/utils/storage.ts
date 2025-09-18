import type { WorkspaceLayout, Tab } from '../types';

const STORAGE_KEYS = {
  WORKSPACE: 'obsidian-workspace',
  TABS: 'obsidian-tabs',
  THEME: 'obsidian-theme',
} as const;

export const storage = {
  // 工作区布局
  saveWorkspace: (workspace: WorkspaceLayout) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(workspace));
    } catch (error) {
      console.error('Failed to save workspace:', error);
    }
  },

  loadWorkspace: (): WorkspaceLayout | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load workspace:', error);
      return null;
    }
  },

  // 标签数据
  saveTabs: (tabs: { [fileId: string]: Tab }) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
    } catch (error) {
      console.error('Failed to save tabs:', error);
    }
  },

  loadTabs: (): { [fileId: string]: Tab } | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TABS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load tabs:', error);
      return null;
    }
  },

  // 主题设置
  saveTheme: (theme: 'light' | 'dark') => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },

  loadTheme: (): 'light' | 'dark' | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      return stored as 'light' | 'dark' | null;
    } catch (error) {
      console.error('Failed to load theme:', error);
      return null;
    }
  },

  // 清除所有存储数据
  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};

// 防抖保存函数
export const createDebouncedSave = <T>(
  saveFunc: (data: T) => void,
  delay: number = 500
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (data: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      saveFunc(data);
    }, delay);
  };
};