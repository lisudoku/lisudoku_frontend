import type { ReactNode } from 'react'
import type { TechniqueKind } from 'lisudoku-solver'

export type ExternalResource = {
  name: string
  url: string
}

export type Technique = {
  id: TechniqueKind
  akas?: string[]
  summary: ReactNode
  externalResources?: ExternalResource[]
  practicePuzzleIds?: string[]
}
