import { useEffect } from 'react';

interface KeyboardShortcuts {
  onSearch: () => void;
  onTogglePreview: () => void;
  onToggleTheme: () => void;
}

export const useKeyboardShortcuts = ({
  onSearch,
  onTogglePreview,
  onToggleTheme,
}: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+F or Cmd+Shift+F for search
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        onSearch();
      }

      // Ctrl+E or Cmd+E for toggle preview
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        onTogglePreview();
      }

      // Ctrl+Shift+T or Cmd+Shift+T for toggle theme
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        onToggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSearch, onTogglePreview, onToggleTheme]);
};