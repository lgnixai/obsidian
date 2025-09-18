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
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No file selected</h2>
          <p>Select a file from the sidebar to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="prose prose-gray dark:prose-invert max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-gray-100
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-strong:text-gray-900 dark:prose-strong:text-gray-100
            prose-code:text-pink-600 dark:prose-code:text-pink-400
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800
            prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
            prose-blockquote:border-l-blue-500 dark:prose-blockquote:border-l-blue-400
            prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
            prose-a:text-blue-600 dark:prose-a:text-blue-400
            prose-a:no-underline hover:prose-a:underline
            prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-table:text-gray-700 dark:prose-table:text-gray-300
            prose-th:text-gray-900 dark:prose-th:text-gray-100
            prose-td:border-gray-300 dark:prose-td:border-gray-600
            prose-th:border-gray-300 dark:prose-th:border-gray-600">
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