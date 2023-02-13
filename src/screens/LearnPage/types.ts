import { ReactNode } from 'react'
import { StepRule } from 'src/types/wasm'

export type ExternalResource = {
  name: string
  url: string
}

export type Technique = {
  id: StepRule
  akas?: string[]
  summary: ReactNode
  externalResources?: ExternalResource[]
  practicePuzzleIds?: string[]
}
