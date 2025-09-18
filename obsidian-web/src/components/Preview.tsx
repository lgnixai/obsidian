import { useMemo } from 'react'
import { useVault } from '../store/vault'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function Preview() {
  const { currentNoteId, notes } = useVault()
  const current = currentNoteId ? notes.find((n) => n.id === currentNoteId) : null

  const html = useMemo(() => {
    const src = current?.content ?? ''
    const raw = marked.parse(src, { async: false }) as string
    return DOMPurify.sanitize(raw)
  }, [current?.content])

  return (
    <div className="h-full overflow-auto prose prose-invert max-w-none px-4 py-2" dangerouslySetInnerHTML={{ __html: html }} />
  )
}

