import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import Sidebar from './Sidebar';
import Editor from './Editor';
import Preview from './Preview';
import Toolbar from './Toolbar';
import SearchModal from './SearchModal';

const Layout: React.FC = () => {
  const { theme, togglePreviewMode, setTheme } = useAppStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useKeyboardShortcuts({
    onSearch: () => setIsSearchOpen(true),
    onTogglePreview: togglePreviewMode,
    onToggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
  });

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex-1 flex bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Toolbar onSearchOpen={() => setIsSearchOpen(true)} />
          <div className="flex-1 flex">
            <Editor />
            <Preview />
          </div>
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