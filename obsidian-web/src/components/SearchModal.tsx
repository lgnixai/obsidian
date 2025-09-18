import React, { useState, useEffect } from 'react';
import { Search, X, File } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import type { FileNode } from '../types';

interface SearchResult {
  file: FileNode;
  matches: { line: number; text: string; matchStart: number; matchEnd: number }[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { files, setCurrentFile } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchInFiles = (files: FileNode[], query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const searchQuery = query.toLowerCase();

    const searchFile = (file: FileNode) => {
      if (file.type === 'file' && file.content) {
        const lines = file.content.split('\n');
        const matches: SearchResult['matches'] = [];

        lines.forEach((line, index) => {
          const lowerLine = line.toLowerCase();
          let searchIndex = 0;
          
          while (true) {
            const matchIndex = lowerLine.indexOf(searchQuery, searchIndex);
            if (matchIndex === -1) break;
            
            matches.push({
              line: index + 1,
              text: line,
              matchStart: matchIndex,
              matchEnd: matchIndex + searchQuery.length,
            });
            
            searchIndex = matchIndex + 1;
          }
        });

        if (matches.length > 0) {
          results.push({ file, matches });
        }
      }

      if (file.children) {
        file.children.forEach(searchFile);
      }
    };

    files.forEach(searchFile);
    return results;
  };

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchInFiles(files, query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, files]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleFileSelect = (file: FileNode) => {
    setCurrentFile(file);
    onClose();
  };

  const highlightMatch = (text: string, matchStart: number, matchEnd: number) => {
    return (
      <>
        {text.slice(0, matchStart)}
        <span className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {text.slice(matchStart, matchEnd)}
        </span>
        {text.slice(matchEnd)}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-600">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search in all files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="ml-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {query.trim() && results.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No results found for "{query}"
            </div>
          )}

          {results.map((result, resultIndex) => (
            <div key={`${result.file.id}-${resultIndex}`} className="mb-6">
              <button
                onClick={() => handleFileSelect(result.file)}
                className="flex items-center w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 mb-2"
              >
                <File className="w-4 h-4 text-blue-500 mr-2" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {result.file.name}
                </span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}
                </span>
              </button>

              <div className="ml-6 space-y-1">
                {result.matches.slice(0, 3).map((match, matchIndex) => (
                  <div
                    key={matchIndex}
                    className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <div className="flex items-center mb-1">
                      <span className="text-xs text-gray-400 mr-2">
                        Line {match.line}:
                      </span>
                    </div>
                    <div className="font-mono text-xs">
                      {highlightMatch(match.text, match.matchStart, match.matchEnd)}
                    </div>
                  </div>
                ))}
                {result.matches.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    +{result.matches.length - 3} more matches
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>
              {results.reduce((total, result) => total + result.matches.length, 0)} results
              in {results.length} files
            </span>
            <span>Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;