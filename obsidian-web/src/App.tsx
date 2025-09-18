import './App.css'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import { useVault } from './store/vault'
import { Eye, SplitSquareHorizontal } from 'lucide-react'
import { useState } from 'react'

export default function App() {
  const { currentNoteId, createNote } = useVault()
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split')

  return (
    <div className="h-full grid" style={{ gridTemplateRows: '40px 1fr' }}>
      <header className="border-b border-border flex items-center justify-between px-3">
        <div className="font-medium">Obsidian Web</div>
        <div className="flex items-center gap-2">
          <button className={`px-2 py-1 rounded ${mode === 'edit' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted/60'}`} onClick={() => setMode('edit')}>
            Edit
          </button>
          <button className={`px-2 py-1 rounded ${mode === 'preview' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted/60'}`} onClick={() => setMode('preview')}>
            <Eye className="inline-block mr-1" size={16} /> Preview
          </button>
          <button className={`px-2 py-1 rounded ${mode === 'split' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted/60'}`} onClick={() => setMode('split')}>
            <SplitSquareHorizontal className="inline-block mr-1" size={16} /> Split
          </button>
          <button className="ml-2 px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90" onClick={() => createNote({ title: 'Untitled' })}>
            New Note
          </button>
        </div>
      </header>
      <div className="grid" style={{ gridTemplateColumns: '18rem 1fr' }}>
        <Sidebar />
        {currentNoteId ? (
          mode === 'edit' ? (
            <Editor />
          ) : mode === 'preview' ? (
            <Preview />
          ) : (
            <div className="grid grid-cols-2">
              <Editor />
              <Preview />
            </div>
          )
        ) : (
          <div className="flex items-center justify-center opacity-70">Select or create a note to start</div>
        )}
      </div>
    </div>
  )
}
