import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useMemo } from 'react'
import { useVault } from '../store/vault'
import type { VaultFile } from '../store/vault'

export default function Preview() {
  const { selectedFileId, getNodeById } = useVault()
  const file = useMemo(() => {
    const node = selectedFileId ? getNodeById(selectedFileId) : undefined
    return node && node.type === 'file' ? (node as VaultFile) : undefined
  }, [selectedFileId, getNodeById])

  if (!file) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
        No file selected
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-auto p-4 prose prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {file.content || ''}
      </ReactMarkdown>
    </div>
  )
}

