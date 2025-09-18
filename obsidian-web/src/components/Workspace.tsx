import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import TabBar from './TabBar';
import Editor from './Editor';
import Preview from './Preview';

const Workspace: React.FC = () => {
  const { workspace, isPreviewMode } = useAppStore();

  if (workspace.groups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No tabs open</h2>
          <p>Open a file from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  const renderTabGroup = (group: any) => {
    const isActive = group.id === workspace.activeGroupId;
    
    return (
      <div 
        key={group.id}
        className="flex flex-col flex-1 min-w-0"
        style={{
          flex: group.size || 1,
        }}
      >
        {/* 标签栏 */}
        <TabBar group={group} isActive={isActive} />
        
        {/* 内容区域 */}
        <div className="flex-1 flex">
          {/* 只有活动组才显示编辑器 */}
          {isActive && (
            <>
              {!isPreviewMode && <Editor />}
              {isPreviewMode && <Preview />}
            </>
          )}
          
          {/* 非活动组显示占位符 */}
          {!isActive && (
            <div className="flex-1 bg-secondary flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">Click to activate this tab group</p>
                {group.activeTabId && (
                  <p className="text-xs mt-1 opacity-75">
                    {group.tabs.find((t: any) => t.id === group.activeTabId)?.title}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSplitLayout = () => {
    if (workspace.groups.length === 1) {
      return renderTabGroup(workspace.groups[0]);
    }

    // 根据分割方向渲染布局
    const containerClass = workspace.splitDirection === 'horizontal' 
      ? 'flex flex-row' 
      : 'flex flex-col';

    return (
      <div className={`${containerClass} flex-1`}>
        {workspace.groups.map((group, index) => (
          <React.Fragment key={group.id}>
            {renderTabGroup(group)}
            
            {/* 分割线 */}
            {index < workspace.groups.length - 1 && (
              <div 
                className={`
                  bg-border hover:bg-ring transition-colors cursor-col-resize
                  ${workspace.splitDirection === 'horizontal' ? 'w-1 min-w-1' : 'h-1 min-h-1'}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {renderSplitLayout()}
    </div>
  );
};

export default Workspace;