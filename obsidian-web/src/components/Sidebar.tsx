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
          className={`flex items-center px-2 py-1 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
            currentFile?.id === file.id ? 'bg-secondary text-secondary-foreground' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(file)}
          onContextMenu={(e) => handleContextMenu(e, file)}
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
              className="flex-1 bg-transparent border-b border-primary focus:outline-none"
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
      <div className="w-64 bg-secondary border-r border-border flex flex-col">
        {/* Search Bar */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* New File/Folder Buttons */}
        <div className="p-2 border-b border-border">
          <div className="flex gap-1">
            <button
              onClick={() => handleNewFile('/', 'file')}
              className="flex items-center px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
              title="New File"
            >
              <Plus className="w-3 h-3 mr-1" />
              File
            </button>
            <button
              onClick={() => handleNewFile('/', 'folder')}
              className="flex items-center px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-accent"
              title="New Folder"
            >
              <Plus className="w-3 h-3 mr-1" />
              Folder
            </button>
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto">
          {renderFileTree(files)}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-20 bg-popover text-popover-foreground border border-border rounded shadow-lg py-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => handleNewFile(contextMenu.file.path, 'file')}
              className="w-full px-3 py-1 text-left text-sm hover:bg-accent flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New File
            </button>
            <button
              onClick={() => handleNewFile(contextMenu.file.path, 'folder')}
              className="w-full px-3 py-1 text-left text-sm hover:bg-accent flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </button>
            <hr className="my-1 border-border" />
            <button
              onClick={() => handleRename(contextMenu.file)}
              className="w-full px-3 py-1 text-left text-sm hover:bg-accent flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Rename
            </button>
            <button
              onClick={() => handleDelete(contextMenu.file)}
              className="w-full px-3 py-1 text-left text-sm hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center text-red-600"
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