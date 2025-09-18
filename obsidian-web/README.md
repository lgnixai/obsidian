# Obsidian Web Clone

A web-based clone of Obsidian built with React, TypeScript, and Tailwind CSS. This application provides a modern note-taking experience with Markdown editing, file management, and powerful search capabilities.

## 🚀 Features

### ✅ Core Features Implemented

- **📝 Markdown Editor**: Monaco Editor with syntax highlighting and auto-completion
- **👁️ Live Preview**: Real-time Markdown rendering with GitHub Flavored Markdown support
- **📁 File Management**: Create, delete, rename files and folders with a tree-view sidebar
- **🔍 Global Search**: Full-text search across all files with result highlighting
- **🎨 Theme Support**: Dark/Light theme switching with system preference detection
- **⌨️ Keyboard Shortcuts**: 
  - `Ctrl/Cmd + Shift + F`: Global search
  - `Ctrl/Cmd + E`: Toggle preview mode
  - `Ctrl/Cmd + Shift + T`: Toggle theme
- **📱 Responsive Design**: Optimized for desktop and mobile devices

### 🎯 User Interface

- **Sidebar**: File browser with context menu for file operations
- **Toolbar**: Quick access to preview toggle, theme switch, and search
- **Editor**: Full-featured Monaco Editor with Markdown support
- **Preview**: Beautiful rendered Markdown with typography styling
- **Search Modal**: Advanced search with file and line-level results

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Tailwind Typography
- **Editor**: Monaco Editor
- **Markdown**: React Markdown with remark-gfm
- **State Management**: Zustand
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Development**: ESLint, PostCSS

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd obsidian-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Layout.tsx      # Main layout component
│   ├── Sidebar.tsx     # File browser sidebar
│   ├── Toolbar.tsx     # Top toolbar
│   ├── Editor.tsx      # Monaco editor wrapper
│   ├── Preview.tsx     # Markdown preview
│   └── SearchModal.tsx # Global search modal
├── hooks/              # Custom React hooks
│   └── useKeyboardShortcuts.ts
├── stores/             # Zustand state management
│   └── useAppStore.ts  # Main application store
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
├── styles/             # Additional CSS styles
└── App.tsx            # Main application component
```

## 🎮 Usage

### File Management

- **Create Files**: Click the "File" button in the sidebar or right-click in the file tree
- **Create Folders**: Click the "Folder" button in the sidebar or right-click in the file tree
- **Rename**: Right-click on any file/folder and select "Rename"
- **Delete**: Right-click on any file/folder and select "Delete"

### Editing

- Click on any `.md` file to open it in the editor
- Start typing to edit the content
- Changes are saved automatically

### Preview

- Click the eye icon in the toolbar or press `Ctrl/Cmd + E` to toggle preview mode
- Preview supports GitHub Flavored Markdown including:
  - Tables
  - Task lists
  - Code blocks with syntax highlighting
  - Links and images

### Search

- Click the search icon in the toolbar or press `Ctrl/Cmd + Shift + F`
- Type your search query to find text across all files
- Click on results to jump to the file
- Use `Escape` to close the search modal

### Themes

- Click the theme toggle in the toolbar or press `Ctrl/Cmd + Shift + T`
- Supports both light and dark themes
- Theme preference is saved locally

## 🔧 Configuration

The application uses Tailwind CSS for styling. You can customize the theme by modifying:

- `tailwind.config.js`: Tailwind configuration
- `src/App.css`: Custom CSS styles
- `src/index.css`: Global styles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [Obsidian](https://obsidian.md/)
- Built with [React](https://reactjs.org/)
- Editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Markdown rendering by [React Markdown](https://github.com/remarkjs/react-markdown)

## 🚧 Future Enhancements

- [ ] Graph view for note connections
- [ ] Plugin system
- [ ] Vim key bindings
- [ ] Export functionality
- [ ] Real-time collaboration
- [ ] Mobile app version
- [ ] Cloud synchronization