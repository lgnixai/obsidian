import { useEffect } from 'react';

interface KeyboardShortcuts {
  onSearch: () => void;
  onTogglePreview: () => void;
  onToggleTheme: () => void;
  onNewTab?: () => void;
  onCloseTab?: () => void;
  onNextTab?: () => void;
  onPrevTab?: () => void;
  onSplitHorizontal?: () => void;
  onSplitVertical?: () => void;
}

export const useKeyboardShortcuts = ({
  onSearch,
  onTogglePreview,
  onToggleTheme,
  onNewTab,
  onCloseTab,
  onNextTab,
  onPrevTab,
  onSplitHorizontal,
  onSplitVertical,
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

      // Ctrl+T or Cmd+T for new tab
      if ((event.ctrlKey || event.metaKey) && event.key === 't' && !event.shiftKey) {
        event.preventDefault();
        onNewTab?.();
      }

      // Ctrl+W or Cmd+W for close tab
      if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
        event.preventDefault();
        onCloseTab?.();
      }

      // Ctrl+Tab for next tab
      if (event.ctrlKey && event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        onNextTab?.();
      }

      // Ctrl+Shift+Tab for previous tab
      if (event.ctrlKey && event.shiftKey && event.key === 'Tab') {
        event.preventDefault();
        onPrevTab?.();
      }

      // Ctrl+\ or Cmd+\ for split horizontal
      if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
        event.preventDefault();
        onSplitHorizontal?.();
      }

      // Ctrl+Shift+\ or Cmd+Shift+\ for split vertical
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === '\\') {
        event.preventDefault();
        onSplitVertical?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSearch, onTogglePreview, onToggleTheme, onNewTab, onCloseTab, onNextTab, onPrevTab, onSplitHorizontal, onSplitVertical]);
};