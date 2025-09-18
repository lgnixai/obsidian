import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ui/context-menu';
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

  // Removed legacy custom context menu state in favor of shadcn ContextMenu
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      setCurrentFile(file);
    } else {
      toggleFolder(file.id);
    }
  };

  // no-op: context menu handled by shadcn components

  const handleNewFile = (parentPath: string, type: 'file' | 'folder') => {
    const name = type === 'file' ? 'New Note.md' : 'New Folder';
    addFile(parentPath, name, type);
  };

  const handleRename = (file: FileNode) => {
    setEditingFile(file.id);
    setEditName(file.name);
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
  };

  const renderFileTree = (files: FileNode[], level = 0) => {
    return files.map((file) => (
      <div key={file.id}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={`flex items-center px-2 py-1 cursor-pointer hover:bg-accent ${
                currentFile?.id === file.id ? 'bg-accent' : ''
              }`}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => handleFileClick(file)}
            >
              {file.type === 'folder' ? (
                file.isExpanded ? (
                  <FolderOpen className="w-4 h-4 mr-2 text-primary" />
                ) : (
                  <Folder className="w-4 h-4 mr-2 text-primary" />
                )
              ) : (
                <File className="w-4 h-4 mr-2 text-muted-foreground" />
              )}

              {editingFile === file.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRenameSubmit(file.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(file.id);
                    if (e.key === 'Escape') setEditingFile(null);
                  }}
                  className="flex-1 bg-transparent border-b border-ring focus:outline-none"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm truncate">{file.name}</span>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem onClick={() => handleNewFile(file.path, 'file')}>
              <Plus className="w-4 h-4 mr-2" /> New File
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleNewFile(file.path, 'folder')}>
              <Plus className="w-4 h-4 mr-2" /> New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => handleRename(file)}>
              <Edit className="w-4 h-4 mr-2" /> Rename
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleDelete(file)} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

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
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Search Bar */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-sm"
            />
          </div>
        </div>

        {/* New File/Folder Buttons */}
        <div className="p-2 border-b border-border">
          <div className="flex gap-2">
            <Button size="sm" className="h-7" onClick={() => handleNewFile('/', 'file')} title="New File">
              <Plus className="w-3 h-3 mr-1" /> File
            </Button>
            <Button size="sm" variant="secondary" className="h-7" onClick={() => handleNewFile('/', 'folder')} title="New Folder">
              <Plus className="w-3 h-3 mr-1" /> Folder
            </Button>
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto">
          {renderFileTree(files)}
        </div>
      </div>

      {/* Legacy contextMenu state kept for positioning but replaced by shadcn ContextMenu above */}
    </>
  );
};

export default Sidebar;