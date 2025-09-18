import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useAppStore } from '../stores/useAppStore';

const Editor: React.FC = () => {
  const { 
    currentFile, 
    isPreviewMode, 
    theme,
    updateFileContent 
  } = useAppStore();

  const handleEditorChange = (value: string | undefined) => {
    if (currentFile && value !== undefined) {
      updateFileContent(currentFile.id, value);
    }
  };

  if (isPreviewMode) {
    return null;
  }

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No file selected</h2>
          <p>Select a file from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background">
      <MonacoEditor
        height="100%"
        language="markdown"
        value={currentFile.content || ''}
        onChange={handleEditorChange}
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 1.6,
          padding: { top: 16, bottom: 16 },
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          renderLineHighlight: 'none',
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          suggest: {
            showKeywords: false,
            showSnippets: false,
          },
        }}
      />
    </div>
  );
};

export default Editor;