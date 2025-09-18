import React, { useState } from 'react';
import { 
  File, 
  Folder, 
  FolderOpen, 
  Plus, 
  Search, 
  Edit,
  Trash2
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import type { FileNode } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';

const Sidebar: React.FC = () => {
  const { 
    files, 
    currentFile, 
    searchQuery,
    setCurrentFile, 
    setSearchQuery,
    addFile,
    deleteFile,
    renameFile,
    toggleFolder
  } = useAppStore();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileNode;
  } | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      setCurrentFile(file);
    } else {
      toggleFolder(file.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file
    });
  };

  const handleNewFile = (parentPath: string, type: 'file' | 'folder') => {
    const name = type === 'file' ? 'New Note.md' : 'New Folder';
    addFile(parentPath, name, type);
    setContextMenu(null);
  };

  const handleRename = (file: FileNode) => {
    setEditingFile(file.id);
    setEditName(file.name);
    setContextMenu(null);
  };

  const handleRenameSubmit = (fileId: string) => {
    if (editName.trim()) {
      renameFile(fileId, editName.trim());
    }
    setEditingFile(null);
    setEditName('');
  };

  const handleDelete = (file: FileNode) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      deleteFile(file.id);
    }
    setContextMenu(null);
  };

  const renderFileTree = (files: FileNode[], level = 0) => {
    return files.map((file) => (
      <div key={file.id}>
        <div
          className={cn(
            "flex items-center px-2 py-1 cursor-pointer rounded-sm transition-colors",
            "hover:bg-obsidian-interactive-hover",
            currentFile?.id === file.id 
              ? "bg-obsidian-interactive-accent text-white" 
              : "text-obsidian-text-normal"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(file)}
          onContextMenu={(e) => handleContextMenu(e, file)}
        >
          {file.type === 'folder' ? (
            file.isExpanded ? (
              <FolderOpen className="w-4 h-4 mr-2 text-obsidian-text-accent" />
            ) : (
              <Folder className="w-4 h-4 mr-2 text-obsidian-text-accent" />
            )
          ) : (
            <File className="w-4 h-4 mr-2 text-obsidian-text-muted" />
          )}
          
          {editingFile === file.id ? (
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRenameSubmit(file.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit(file.id);
                if (e.key === 'Escape') setEditingFile(null);
              }}
              className="flex-1 h-6 text-xs bg-transparent border-b border-obsidian-text-accent focus-visible:ring-0"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-sm truncate">{file.name}</span>
          )}
        </div>
        
        {file.type === 'folder' && file.isExpanded && file.children && (
          <div>
            {renderFileTree(file.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
      <div className="w-64 bg-obsidian-bg-secondary border-r border-obsidian-divider flex flex-col">
        {/* Search Bar */}
        <div className="p-3 border-b border-obsidian-divider">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-obsidian-text-muted" />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 text-sm bg-obsidian-bg-primary border-obsidian-divider"
            />
          </div>
        </div>

        {/* New File/Folder Buttons */}
        <div className="p-2 border-b border-obsidian-divider">
          <div className="flex gap-1">
            <Button
              onClick={() => handleNewFile('/', 'file')}
              variant="obsidian-accent"
              size="sm"
              className="text-xs"
              title="New File"
            >
              <Plus className="w-3 h-3 mr-1" />
              File
            </Button>
            <Button
              onClick={() => handleNewFile('/', 'folder')}
              variant="obsidian"
              size="sm"
              className="text-xs"
              title="New Folder"
            >
              <Plus className="w-3 h-3 mr-1" />
              Folder
            </Button>
          </div>
        </div>

        {/* File Tree */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {renderFileTree(files)}
          </div>
        </ScrollArea>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-20 bg-obsidian-bg-primary border border-obsidian-divider rounded shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => handleNewFile(contextMenu.file.path, 'file')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-obsidian-interactive-hover flex items-center text-obsidian-text-normal"
            >
              <Plus className="w-4 h-4 mr-2" />
              New File
            </button>
            <button
              onClick={() => handleNewFile(contextMenu.file.path, 'folder')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-obsidian-interactive-hover flex items-center text-obsidian-text-normal"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </button>
            <Separator className="my-1" />
            <button
              onClick={() => handleRename(contextMenu.file)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-obsidian-interactive-hover flex items-center text-obsidian-text-normal"
            >
              <Edit className="w-4 h-4 mr-2" />
              Rename
            </button>
            <button
              onClick={() => handleDelete(contextMenu.file)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-obsidian-interactive-hover flex items-center text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;