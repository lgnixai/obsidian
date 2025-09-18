import { useMemo, useState } from 'react'
import { useVault } from '../store/vault'
import type { VaultNode } from '../store/vault'

function NodeItem({ node }: { node: VaultNode }) {
  const { selectFile, selectedFileId, deleteNode, renameNode, createNode } = useVault()
  const [isRenaming, setIsRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(node.name)
  const isSelected = node.type === 'file' && node.id === selectedFileId

  const handleRenameCommit = () => {
    if (nameDraft.trim() && nameDraft !== node.name) {
      renameNode(node.id, nameDraft.trim())
    }
    setIsRenaming(false)
  }

  if (node.type === 'folder') {
    return (
      <div className="mb-2">
        <div className="flex items-center justify-between">
          {isRenaming ? (
            <input
              className="bg-transparent outline-none px-1 py-0.5 rounded hover:bg-secondary/60 focus:bg-secondary"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={handleRenameCommit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameCommit()
                if (e.key === 'Escape') setIsRenaming(false)
              }}
              autoFocus
            />
          ) : (
            <button
              className="text-left font-medium hover:underline"
              onDoubleClick={() => setIsRenaming(true)}
            >
              {node.name}
            </button>
          )}
          <div className="flex gap-1">
            <button className="text-xs px-1 py-0.5 hover:bg-secondary rounded" onClick={() => createNode(node.id, 'file')}>+File</button>
            <button className="text-xs px-1 py-0.5 hover:bg-secondary rounded" onClick={() => createNode(node.id, 'folder')}>+Folder</button>
            <button className="text-xs px-1 py-0.5 hover:bg-secondary rounded" onClick={() => setIsRenaming(true)}>Ren</button>
            <button className="text-xs px-1 py-0.5 hover:bg-secondary rounded" onClick={() => deleteNode(node.id)}>Del</button>
          </div>
        </div>
        <div className="ml-4 mt-1 border-l border-border pl-2">
          {node.children.map((child) => (
            <NodeItem key={child.id} node={child} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      {isRenaming ? (
        <input
          className="bg-transparent outline-none px-1 py-0.5 rounded hover:bg-secondary/60 focus:bg-secondary"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={handleRenameCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameCommit()
            if (e.key === 'Escape') setIsRenaming(false)
          }}
          autoFocus
        />
      ) : (
        <button
          className={`text-left hover:underline ${isSelected ? 'text-primary-foreground bg-primary/20 rounded px-1 -mx-1' : ''}`}
          onClick={() => selectFile(node.id)}
          onDoubleClick={() => setIsRenaming(true)}
        >
          {node.name}
        </button>
      )}
      <div className="flex gap-1">
        <button className="text-xs px-1 py-0.5 hover:bg-secondary rounded" onClick={() => setIsRenaming(true)}>Ren</button>
        <button className="text-xs px-1 py-0.5 hover:bg-secondary rounded" onClick={() => deleteNode(node.id)}>Del</button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { tree, createNode } = useVault()
  const rootFolders = useMemo(() => tree, [tree])

  return (
    <aside className="h-full w-64 border-r border-border p-2 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Vault</div>
        <div className="flex gap-1">
          <button className="text-xs px-2 py-1 hover:bg-secondary rounded" onClick={() => createNode(undefined, 'file')}>+File</button>
          <button className="text-xs px-2 py-1 hover:bg-secondary rounded" onClick={() => createNode(undefined, 'folder')}>+Folder</button>
        </div>
      </div>
      <div>
        {rootFolders.map((node) => (
          <NodeItem key={node.id} node={node} />
        ))}
      </div>
    </aside>
  )
}

