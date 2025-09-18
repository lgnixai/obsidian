import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Pin, 
  MoreHorizontal, 
  SplitSquareHorizontal, 
  SplitSquareVertical,
  Copy,
  PinOff
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '../stores/useAppStore';
import type { Tab, TabGroup } from '../types';

interface TabBarProps {
  group: TabGroup;
  isActive: boolean;
}

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onClose: (tabId: string) => void;
  onSwitch: (tabId: string) => void;
  onPin: (tabId: string) => void;
  onUnpin: (tabId: string) => void;
  onDuplicate: (tabId: string) => void;
  onSplit: (tabId: string, direction: 'horizontal' | 'vertical') => void;
}

const SortableTabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  onClose,
  onSwitch,
  onPin,
  onUnpin,
  onDuplicate,
  onSplit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TabItem
        tab={tab}
        isActive={isActive}
        onClose={onClose}
        onSwitch={onSwitch}
        onPin={onPin}
        onUnpin={onUnpin}
        onDuplicate={onDuplicate}
        onSplit={onSplit}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

interface TabItemBaseProps extends TabItemProps {
  dragHandleProps?: any;
}

const TabItem: React.FC<TabItemBaseProps> = ({
  tab,
  isActive,
  onClose,
  onSwitch,
  onPin,
  onUnpin,
  onDuplicate,
  onSplit,
  dragHandleProps,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
  };

  const handleMiddleClick = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      onClose(tab.id);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContextMenu]);

  return (
    <>
      <div
 
        className={`
          group relative flex items-center px-3 py-2 min-w-0 max-w-48 cursor-pointer border-r border-border
          ${isActive 
            ? 'bg-card text-foreground' 
            : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }
        `}
 
        onClick={() => onSwitch(tab.id)}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMiddleClick}
        title={tab.path}
        {...dragHandleProps}
      >
        {/* Pin indicator */}
        {tab.isPinned && (
          <Pin className="w-3 h-3 mr-1 flex-shrink-0 text-obsidian-text-accent" />
        )}
        
        {/* File icon and title */}
        <div className="flex items-center min-w-0 flex-1">
          <span className="truncate text-sm">
            {tab.title}
          </span>
          {tab.isDirty && (
            <div className="w-2 h-2 rounded-full bg-orange-400 ml-2 flex-shrink-0" />
          )}
        </div>

        {/* Close button */}
         <button
          className={`
            ml-2 p-0.5 rounded-md hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity
            ${isActive ? 'opacity-100' : ''}
          `}
 
          onClick={(e) => {
            e.stopPropagation();
            onClose(tab.id);
          }}
          title="Close tab"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
           className="fixed z-50 bg-popover text-popover-foreground border border-border rounded-md shadow-lg py-1 min-w-48"
 
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <button
             className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center"
 
            onClick={() => {
              onDuplicate(tab.id);
              handleCloseContextMenu();
            }}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate Tab
          </button>
          
          <button
             className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center"
 
            onClick={() => {
              onSplit(tab.id, 'horizontal');
              handleCloseContextMenu();
            }}
          >
            <SplitSquareHorizontal className="w-4 h-4 mr-2" />
            Split Right
          </button>
          
          <button
             className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center"
 
            onClick={() => {
              onSplit(tab.id, 'vertical');
              handleCloseContextMenu();
            }}
          >
            <SplitSquareVertical className="w-4 h-4 mr-2" />
            Split Down
          </button>

           <div className="border-t border-border my-1" />
          
          {tab.isPinned ? (
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center"
 
              onClick={() => {
                onUnpin(tab.id);
                handleCloseContextMenu();
              }}
            >
              <PinOff className="w-4 h-4 mr-2" />
              Unpin Tab
            </button>
          ) : (
            <button
               className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center"
 
              onClick={() => {
                onPin(tab.id);
                handleCloseContextMenu();
              }}
            >
              <Pin className="w-4 h-4 mr-2" />
              Pin Tab
            </button>
          )}

           <div className="border-t border-border my-1" />
 
          
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center"
            onClick={() => {
              onClose(tab.id);
              handleCloseContextMenu();
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Close Tab
          </button>
        </div>
      )}
    </>
  );
};

const TabBar: React.FC<TabBarProps> = ({ group, isActive }) => {
  const { 
    closeTab, 
    switchToTab, 
    pinTab, 
    unpinTab, 
    duplicateTab,
    splitTabGroup,
    setActiveTabGroup,
    openFileInTab,
    reorderTabs
  } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTabClose = (tabId: string) => {
    closeTab(tabId);
  };

  const handleTabSwitch = (tabId: string) => {
    switchToTab(tabId);
    setActiveTabGroup(group.id);
  };

  const handleTabPin = (tabId: string) => {
    pinTab(tabId);
  };

  const handleTabUnpin = (tabId: string) => {
    unpinTab(tabId);
  };

  const handleTabDuplicate = (tabId: string) => {
    duplicateTab(tabId);
  };

  const handleTabSplit = (tabId: string, direction: 'horizontal' | 'vertical') => {
    splitTabGroup(group.id, direction, tabId);
  };

  const handleNewTab = () => {
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
    
    // 这里应该调用 addFile 方法，但为了简化，我们直接在标签中打开
    openFileInTab(newFile, group.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = group.tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = group.tabs.findIndex((tab) => tab.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderTabs(group.id, oldIndex, newIndex);
      }
    }
  };

  // 分离固定标签和普通标签
  const pinnedTabs = group.tabs.filter(tab => tab.isPinned);
  const unpinnedTabs = group.tabs.filter(tab => !tab.isPinned);

  return (
    <div 
       className={`
        flex items-center bg-secondary border-b border-border min-h-10
        ${isActive ? 'ring-1 ring-ring ring-inset' : ''}
      `}
 
      onClick={() => setActiveTabGroup(group.id)}
    >
      {/* 标签容器 */}
      <div className="flex flex-1 overflow-x-auto scrollbar-thin">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* 固定标签 */}
          {pinnedTabs.length > 0 && (
            <SortableContext 
              items={pinnedTabs.map(tab => tab.id)} 
              strategy={horizontalListSortingStrategy}
            >
              {pinnedTabs.map((tab) => (
                <SortableTabItem
                  key={tab.id}
                  tab={tab}
                  isActive={tab.isActive}
                  onClose={handleTabClose}
                  onSwitch={handleTabSwitch}
                  onPin={handleTabPin}
                  onUnpin={handleTabUnpin}
                  onDuplicate={handleTabDuplicate}
                  onSplit={handleTabSplit}
                />
              ))}
            </SortableContext>
          )}
          
          {/* 分隔线 */}
          {pinnedTabs.length > 0 && unpinnedTabs.length > 0 && (
            <Separator orientation="vertical" className="mx-1 self-stretch h-6" />
          )}
          
          {/* 普通标签 */}
          {unpinnedTabs.length > 0 && (
            <SortableContext 
              items={unpinnedTabs.map(tab => tab.id)} 
              strategy={horizontalListSortingStrategy}
            >
              {unpinnedTabs.map((tab) => (
                <SortableTabItem
                  key={tab.id}
                  tab={tab}
                  isActive={tab.isActive}
                  onClose={handleTabClose}
                  onSwitch={handleTabSwitch}
                  onPin={handleTabPin}
                  onUnpin={handleTabUnpin}
                  onDuplicate={handleTabDuplicate}
                  onSplit={handleTabSplit}
                />
              ))}
            </SortableContext>
          )}
        </DndContext>
      </div>

      {/* 新建标签按钮 */}
       <button
        className="p-2 hover:bg-accent text-muted-foreground rounded-md"
 
        onClick={handleNewTab}
        title="New Tab"
      >
        <Plus className="w-4 h-4" />
      </Button>

      {/* 更多选项按钮 */}
       <button
        className="p-2 hover:bg-accent text-muted-foreground rounded-md"
 
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default TabBar;