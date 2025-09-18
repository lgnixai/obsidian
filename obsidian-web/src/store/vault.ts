import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid/non-secure'
import { set as idbSet } from 'idb-keyval'

export type Note = {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export type VaultState = {
  notes: Note[]
  currentNoteId: string | null
  searchQuery: string
}

type VaultActions = {
  createNote: (partial?: { title?: string; content?: string }) => string
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (id: string | null) => void
  setSearchQuery: (query: string) => void
  importNotes: (notes: Note[]) => void
}

export type VaultStore = VaultState & VaultActions

const IDB_KEY = 'obsidian-web/vault@v1'

// Reserved for future migration from localStorage to IndexedDB

async function saveToIndexedDb(state: VaultState): Promise<void> {
  const payload: IDBPayload = { state, timestamp: Date.now() }
  try {
    await idbSet(IDB_KEY, payload)
  } catch {
    // ignore
  }
}

type IDBPayload = {
  state: VaultState
  timestamp: number
}

const initialState: VaultState = {
  notes: [],
  currentNoteId: null,
  searchQuery: '',
}

export const useVault = create<VaultStore>()(
  persist(
    (set) => ({
      ...initialState,
      createNote: (partial) => {
        const now = Date.now()
        const newNote: Note = {
          id: nanoid(12),
          title: partial?.title ?? 'Untitled',
          content: partial?.content ?? '',
          createdAt: now,
          updatedAt: now,
        }
        set((s) => {
          const next: VaultState = {
            ...s,
            notes: [newNote, ...s.notes],
            currentNoteId: newNote.id,
          }
          void saveToIndexedDb(next)
          return next
        })
        return newNote.id
      },
      updateNote: (id, updates) => {
        set((s) => {
          const notes = s.notes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  ...updates,
                  updatedAt: Date.now(),
                }
              : n,
          )
          const next: VaultState = { ...s, notes }
          void saveToIndexedDb(next)
          return next
        })
      },
      deleteNote: (id) => {
        set((s) => {
          const filtered = s.notes.filter((n) => n.id !== id)
          const next: VaultState = {
            ...s,
            notes: filtered,
            currentNoteId: s.currentNoteId === id ? (filtered[0]?.id ?? null) : s.currentNoteId,
          }
          void saveToIndexedDb(next)
          return next
        })
      },
      setCurrentNote: (id) => set((s) => ({ ...s, currentNoteId: id })),
      setSearchQuery: (query) => set((s) => ({ ...s, searchQuery: query })),
      importNotes: (notes) =>
        set((s) => {
          const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)
          const next: VaultState = { ...s, notes: sorted, currentNoteId: sorted[0]?.id ?? null }
          void saveToIndexedDb(next)
          return next
        }),
    }),
    {
      name: 'obsidian-web/zustand',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ notes: s.notes, currentNoteId: s.currentNoteId, searchQuery: s.searchQuery }),
    },
  ),
)

export function getCurrentNote(): Note | null {
  const { currentNoteId, notes } = useVault.getState()
  if (!currentNoteId) return null
  return notes.find((n) => n.id === currentNoteId) ?? null
}

