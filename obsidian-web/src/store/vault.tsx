import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

export type VaultNodeType = 'file' | 'folder'

export interface VaultNodeBase {
  id: string
  name: string
  type: VaultNodeType
}

export interface VaultFile extends VaultNodeBase {
  type: 'file'
  content: string
}

export interface VaultFolder extends VaultNodeBase {
  type: 'folder'
  children: VaultNode[]
}

export type VaultNode = VaultFile | VaultFolder

export interface VaultState {
  tree: VaultNode[]
  selectedFileId?: string
}

type CreatePayload = { parentFolderId?: string; nodeType: VaultNodeType }
type RenamePayload = { id: string; newName: string }
type DeletePayload = { id: string }
type SelectPayload = { id?: string }
type UpdateContentPayload = { id: string; content: string }

type VaultAction =
  | { type: 'create'; payload: CreatePayload }
  | { type: 'rename'; payload: RenamePayload }
  | { type: 'delete'; payload: DeletePayload }
  | { type: 'select'; payload: SelectPayload }
  | { type: 'updateContent'; payload: UpdateContentPayload }

const LOCAL_STORAGE_KEY = 'vault-state-v1'

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function cloneTree(nodes: VaultNode[]): VaultNode[] {
  return nodes.map((node) =>
    node.type === 'folder'
      ? { ...node, children: cloneTree(node.children) }
      : { ...node }
  )
}

function findNode(
  nodes: VaultNode[],
  id: string,
  parent?: VaultFolder
): { node?: VaultNode; parent?: VaultFolder } {
  for (const node of nodes) {
    if (node.id === id) return { node, parent }
    if (node.type === 'folder') {
      const found = findNode(node.children, id, node)
      if (found.node) return found
    }
  }
  return {}
}

// Reserved for future transformations on the tree

function removeNode(nodes: VaultNode[], id: string): VaultNode[] {
  return nodes
    .map((n) => (n.type === 'folder' ? { ...n, children: removeNode(n.children, id) } : n))
    .filter((n) => n.id !== id)
}

function insertNode(
  nodes: VaultNode[],
  parentFolderId: string | undefined,
  node: VaultNode
): VaultNode[] {
  if (!parentFolderId) {
    return [...nodes, node]
  }
  return nodes.map((n) => {
    if (n.type === 'folder') {
      if (n.id === parentFolderId) {
        return { ...n, children: [...n.children, node] }
      }
      return { ...n, children: insertNode(n.children, parentFolderId, node) }
    }
    return n
  })
}

function renameNode(nodes: VaultNode[], id: string, newName: string): VaultNode[] {
  return nodes.map((n) => {
    if (n.id === id) {
      return { ...n, name: newName }
    }
    if (n.type === 'folder') {
      return { ...n, children: renameNode(n.children, id, newName) }
    }
    return n
  })
}

function updateFileContent(nodes: VaultNode[], id: string, content: string): VaultNode[] {
  return nodes.map((n) => {
    if (n.id === id && n.type === 'file') {
      return { ...n, content }
    }
    if (n.type === 'folder') {
      return { ...n, children: updateFileContent(n.children, id, content) }
    }
    return n
  })
}

function vaultReducer(state: VaultState, action: VaultAction): VaultState {
  switch (action.type) {
    case 'create': {
      const id = generateId()
      const name = action.payload.nodeType === 'file' ? 'Untitled.md' : 'New Folder'
      const node: VaultNode =
        action.payload.nodeType === 'file'
          ? { id, name, type: 'file', content: '' }
          : { id, name, type: 'folder', children: [] }
      const tree = insertNode(state.tree, action.payload.parentFolderId, node)
      return {
        ...state,
        tree,
        selectedFileId: node.type === 'file' ? node.id : state.selectedFileId,
      }
    }
    case 'rename': {
      const tree = renameNode(state.tree, action.payload.id, action.payload.newName)
      return { ...state, tree }
    }
    case 'delete': {
      const tree = removeNode(state.tree, action.payload.id)
      const selectedFileId = state.selectedFileId === action.payload.id ? undefined : state.selectedFileId
      return { ...state, tree, selectedFileId }
    }
    case 'select': {
      return { ...state, selectedFileId: action.payload.id }
    }
    case 'updateContent': {
      const tree = updateFileContent(state.tree, action.payload.id, action.payload.content)
      return { ...state, tree }
    }
    default:
      return state
  }
}

function loadInitialState(): VaultState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as VaultState
      if (Array.isArray(parsed.tree)) {
        return parsed
      }
    }
  } catch {}

  const welcomeId = generateId()
  const initial: VaultState = {
    tree: [
      {
        id: generateId(),
        name: 'Notes',
        type: 'folder',
        children: [
          {
            id: welcomeId,
            name: 'Welcome.md',
            type: 'file',
            content: `# Obsidian Web (Mock)

This is a lightweight Obsidian-like prototype.

- Create files and folders in the sidebar
- Edit Markdown in the editor
- View rendered Markdown in the preview
`,
          },
        ],
      },
    ],
    selectedFileId: welcomeId,
  }
  return initial
}

export interface VaultContextValue extends VaultState {
  createNode: (parentFolderId: string | undefined, type: VaultNodeType) => void
  renameNode: (id: string, newName: string) => void
  deleteNode: (id: string) => void
  selectFile: (id: string | undefined) => void
  updateContent: (id: string, content: string) => void
  getNodeById: (id: string) => VaultNode | undefined
}

const VaultContext = createContext<VaultContextValue | null>(null)

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(vaultReducer, undefined, loadInitialState)

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const value: VaultContextValue = useMemo(() => {
    return {
      ...state,
      createNode(parentFolderId, type) {
        dispatch({ type: 'create', payload: { parentFolderId, nodeType: type } })
      },
      renameNode(id, newName) {
        dispatch({ type: 'rename', payload: { id, newName } })
      },
      deleteNode(id) {
        dispatch({ type: 'delete', payload: { id } })
      },
      selectFile(id) {
        dispatch({ type: 'select', payload: { id } })
      },
      updateContent(id, content) {
        dispatch({ type: 'updateContent', payload: { id, content } })
      },
      getNodeById(id) {
        if (!id) return undefined
        const cloned = cloneTree(state.tree)
        const found = findNode(cloned, id)
        return found.node
      },
    }
  }, [state])

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used within VaultProvider')
  return ctx
}

