import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import Sidebar from './Sidebar';
import Workspace from './Workspace';
import Toolbar from './Toolbar';
import SearchModal from './SearchModal';

const Layout: React.FC = () => {
  const { 
    theme, 
    togglePreviewMode, 
    setTheme,
    switchToNextTab,
    switchToPrevTab,
    closeCurrentTab,
    createNewTab,
    splitTabGroup,
    workspace
  } = useAppStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useKeyboardShortcuts({
    onSearch: () => setIsSearchOpen(true),
    onTogglePreview: togglePreviewMode,
    onToggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
    onNewTab: createNewTab,
    onCloseTab: closeCurrentTab,
    onNextTab: switchToNextTab,
    onPrevTab: switchToPrevTab,
    onSplitHorizontal: () => {
      const activeGroupId = workspace.activeGroupId;
      if (activeGroupId) {
        splitTabGroup(activeGroupId, 'horizontal');
      }
    },
    onSplitVertical: () => {
      const activeGroupId = workspace.activeGroupId;
      if (activeGroupId) {
        splitTabGroup(activeGroupId, 'vertical');
      }
    },
  });

  // Apply the `.dark` class to the html element so CSS variables take effect globally
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={"h-screen flex flex-col"}>
      <div className="flex-1 flex bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Toolbar onSearchOpen={() => setIsSearchOpen(true)} />
          <Workspace />
        </div>
      </div>
      
      {/* Global Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  );
};

export default Layout;