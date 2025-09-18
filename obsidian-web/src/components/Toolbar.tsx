import React from 'react';
import { 
  Eye, 
  Edit3, 
  Sun, 
  Moon, 
  Search,
  Settings
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

interface ToolbarProps {
  onSearchOpen?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onSearchOpen }) => {
  const { 
    isPreviewMode, 
    theme, 
    currentFile,
    togglePreviewMode, 
    setTheme 
  } = useAppStore();

  return (
    <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      {/* Left section - File info */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {currentFile ? currentFile.name : 'No file selected'}
        </h1>
        {currentFile && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {currentFile.path}
          </span>
        )}
      </div>

      {/* Right section - Controls */}
      <div className="flex items-center space-x-2">
        {/* Preview Toggle */}
        <button
          onClick={togglePreviewMode}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            isPreviewMode ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'text-gray-600 dark:text-gray-400'
          }`}
          title={isPreviewMode ? 'Switch to Edit Mode' : 'Switch to Preview Mode'}
        >
          {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          title="Global Search (Ctrl+Shift+F)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;