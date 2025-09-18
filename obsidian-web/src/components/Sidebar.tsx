import { useMemo, useState } from 'react'
import { useVault, type Note } from '../store/vault'
import { Plus, Trash2, FilePenLine, Search } from 'lucide-react'

export default function Sidebar() {
  const { notes, currentNoteId, createNote, deleteNote, setCurrentNote, searchQuery, setSearchQuery } = useVault()
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState('')

  const filtered = useMemo<Note[]>(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
  }, [notes, searchQuery])

  const onCreate = () => {
    const id = createNote({ title: 'Untitled' })
    setCurrentNote(id)
    setRenamingId(id)
    setTempTitle('Untitled')
  }

  const onRenameCommit = (id: string) => {
    if (!tempTitle.trim()) {
      setRenamingId(null)
      return
    }
    useVault.getState().updateNote(id, { title: tempTitle.trim() })
    setRenamingId(null)
  }

  return (
    <aside className="h-full w-72 border-r border-border flex flex-col">
      <div className="p-2 flex items-center gap-2">
        <button className="px-2 py-1 rounded bg-secondary text-secondary-foreground hover:opacity-90" onClick={onCreate}>
          <Plus className="inline-block mr-1" size={16} /> New
        </button>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2 top-2 opacity-70" />
          <input
            className="w-full bg-muted/40 pl-7 pr-2 py-1 rounded outline-none"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {filtered.map((note) => {
          const isActive = note.id === currentNoteId
          const isRenaming = renamingId === note.id
          return (
            <div key={note.id} className={`px-2 py-1 group flex items-center gap-2 cursor-pointer ${isActive ? 'bg-muted' : 'hover:bg-muted/40'}`} onClick={() => setCurrentNote(note.id)}>
              {isRenaming ? (
                <input
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => onRenameCommit(note.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onRenameCommit(note.id)
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                  className="flex-1 bg-transparent outline-none"
                />
              ) : (
                <div className="flex-1 truncate">{note.title || 'Untitled'}</div>
              )}
              <button
                className="opacity-0 group-hover:opacity-100 px-1 py-0.5 rounded hover:bg-destructive/20"
                onClick={(e) => {
                  e.stopPropagation()
                  setRenamingId(note.id)
                  setTempTitle(note.title)
                }}
                title="Rename"
              >
                <FilePenLine size={16} />
              </button>
              <button
                className="opacity-0 group-hover:opacity-100 px-1 py-0.5 rounded hover:bg-destructive/20"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNote(note.id)
                }}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="p-4 text-sm opacity-70">No notes</div>
        )}
      </div>
    </aside>
  )
}

