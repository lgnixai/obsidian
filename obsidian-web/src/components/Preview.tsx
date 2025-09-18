import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../stores/useAppStore';

const Preview: React.FC = () => {
  const { currentFile, isPreviewMode } = useAppStore();

  if (!isPreviewMode) {
    return null;
  }

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No file selected</h2>
          <p>Select a file from the sidebar to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="prose prose-gray dark:prose-invert max-w-none
            prose-headings:text-foreground
            prose-p:text-foreground/80
            prose-strong:text-foreground
            prose-code:text-pink-600 dark:prose-code:text-pink-400
            prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-secondary
            prose-blockquote:border-l-primary
            prose-blockquote:text-muted-foreground
            prose-a:text-primary hover:prose-a:underline
            prose-li:text-foreground/80
            prose-table:text-foreground/80
            prose-th:text-foreground
            prose-td:border-border
            prose-th:border-border">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom checkbox rendering for task lists
              input: ({ type, checked, ...props }) => {
                if (type === 'checkbox') {
                  return (
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mr-2 accent-blue-500"
                      {...props}
                    />
                  );
                }
                return <input type={type} {...props} />;
              },
              // Custom code block rendering
              code: ({ className, children, ...props }) => {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {currentFile.content || ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Preview;