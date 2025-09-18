import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, ViewUpdate } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'
import { useVault } from '../store/vault'

export default function Editor() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const { currentNoteId, notes, updateNote } = useVault()
  const current = currentNoteId ? notes.find((n) => n.id === currentNoteId) : null

  useEffect(() => {
    if (!containerRef.current || viewRef.current) return
    const startDoc = current?.content ?? ''
    const state = EditorState.create({
      doc: startDoc,
      extensions: [
        markdown(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((vu: ViewUpdate) => {
          if (vu.docChanged && currentNoteId) {
            const text = vu.state.doc.toString()
            updateNote(currentNoteId, { content: text })
          }
        }),
        oneDark,
      ],
    })
    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const newDoc = current?.content ?? ''
    if (newDoc !== view.state.doc.toString()) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: newDoc } })
    }
  }, [current?.id])

  return <div className="h-full" ref={containerRef} />
}

