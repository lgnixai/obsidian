import './App.css'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import { VaultProvider } from './store/vault'
import { useState } from 'react'

export default function App() {
  const [showPreview, setShowPreview] = useState(true)

  return (
    <VaultProvider>
      <div className="h-full grid" style={{ gridTemplateRows: '40px 1fr' }}>
        <header className="border-b border-border flex items-center justify-between px-3">
          <div className="font-semibold">Obsidian Web</div>
          <div className="flex items-center gap-2">
            <button className="text-sm px-2 py-1 hover:bg-secondary rounded" onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </header>
        <div className="grid" style={{ gridTemplateColumns: showPreview ? '256px 1fr 1fr' : '256px 1fr' }}>
          <Sidebar />
          <div className="border-r border-border overflow-hidden">
            <Editor />
          </div>
          {showPreview && <Preview />}
        </div>
      </div>
    </VaultProvider>
  )
}
