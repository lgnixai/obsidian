import React, { useState, useEffect } from 'react';
import { Search, X, File } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import type { FileNode } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';

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
        <span className="bg-obsidian-text-accent/20 text-obsidian-text-accent px-1 rounded">
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
      <div className="relative bg-obsidian-bg-primary rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col border border-obsidian-divider">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-obsidian-divider">
          <Search className="w-5 h-5 text-obsidian-text-muted mr-3" />
          <Input
            type="text"
            placeholder="Search in all files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 text-obsidian-text-normal placeholder:text-obsidian-text-muted"
            autoFocus
          />
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="ml-3 text-obsidian-text-muted hover:text-obsidian-text-normal hover:bg-obsidian-interactive-hover"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 p-4">
          {query.trim() && results.length === 0 && (
            <div className="text-center text-obsidian-text-muted py-8">
              No results found for "{query}"
            </div>
          )}

          {results.map((result, resultIndex) => (
            <div key={`${result.file.id}-${resultIndex}`} className="mb-6">
              <Button
                onClick={() => handleFileSelect(result.file)}
                variant="ghost"
                className="flex items-center w-full justify-start text-left p-2 h-auto hover:bg-obsidian-interactive-hover mb-2"
              >
                <File className="w-4 h-4 text-obsidian-text-accent mr-2" />
                <span className="font-medium text-obsidian-text-normal">
                  {result.file.name}
                </span>
                <span className="ml-2 text-xs text-obsidian-text-muted">
                  {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}
                </span>
              </Button>

              <div className="ml-6 space-y-1">
                {result.matches.slice(0, 3).map((match, matchIndex) => (
                  <div
                    key={matchIndex}
                    className="text-sm text-obsidian-text-muted p-2 bg-obsidian-bg-secondary rounded"
                  >
                    <div className="flex items-center mb-1">
                      <span className="text-xs text-obsidian-text-faint mr-2">
                        Line {match.line}:
                      </span>
                    </div>
                    <div className="font-mono text-xs">
                      {highlightMatch(match.text, match.matchStart, match.matchEnd)}
                    </div>
                  </div>
                ))}
                {result.matches.length > 3 && (
                  <div className="text-xs text-obsidian-text-faint ml-2">
                    +{result.matches.length - 3} more matches
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-obsidian-divider text-xs text-obsidian-text-faint">
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