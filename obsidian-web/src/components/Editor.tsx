import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { useMemo } from 'react'
import { useVault } from '../store/vault'
import type { VaultFile } from '../store/vault'

export default function Editor() {
  const { selectedFileId, getNodeById, updateContent } = useVault()
  const file = useMemo(() => {
    const node = selectedFileId ? getNodeById(selectedFileId) : undefined
    return node && node.type === 'file' ? (node as VaultFile) : undefined
  }, [selectedFileId, getNodeById])

  if (!file) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
        Select or create a Markdown file to start editing
      </div>
    )
  }

  return (
    <div className="h-full">
      <CodeMirror
        height="100%"
        theme={oneDark}
        value={file.content}
        extensions={[markdown({ base: markdownLanguage })]}
        onChange={(value) => updateContent(file.id, value)}
      />
    </div>
  )
}

