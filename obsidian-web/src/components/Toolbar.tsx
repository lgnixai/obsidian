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
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';

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
 
    <div className="h-12 bg-secondary border-b border-border flex items-center justify-between px-4">
      {/* Left section - File info */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-foreground">
          {currentFile ? currentFile.name : 'No file selected'}
        </h1>
        {currentFile && (
          <span className="ml-2 text-xs text-muted-foreground">
 
            {currentFile.path}
          </span>
        )}
      </div>

      {/* Right section - Controls */}
      <div className="flex items-center space-x-1">
        {/* Preview Toggle */}
        <Button
          onClick={togglePreviewMode}
 
          className={`p-2 rounded-md hover:bg-accent ${
            isPreviewMode ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
 
          title={isPreviewMode ? 'Switch to Edit Mode' : 'Switch to Preview Mode'}
        >
          {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Theme Toggle */}
        <Button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
           className="p-2 rounded-md hover:bg-accent text-muted-foreground"
 
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>

        {/* Search */}
        <Button
          onClick={onSearchOpen}
           className="p-2 rounded-md hover:bg-accent text-muted-foreground"
 
          title="Global Search (Ctrl+Shift+F)"
        >
          <Search className="w-4 h-4" />
        </Button>

        {/* Settings */}
         <button
          className="p-2 rounded-md hover:bg-accent text-muted-foreground"
 
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;