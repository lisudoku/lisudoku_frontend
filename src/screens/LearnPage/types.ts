import { Rule } from 'lisudoku-solver'
import { ReactNode } from 'react'

export type ExternalResource = {
  name: string
  url: string
}

export type Technique = {
  id: Rule
  akas?: string[]
  summary: ReactNode
  externalResources?: ExternalResource[]
  practicePuzzleIds?: string[]
}
