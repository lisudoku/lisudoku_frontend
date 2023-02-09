import { Puzzle } from './sudoku'

export type PuzzleCollection = {
  id: number
  name: string
  url: string
  puzzles: Puzzle[]
}

export type Competition = {
  id: number
  name: string
  url: string
  fromDate: string
  toDate: string
  puzzleCollectionId: number | null
  ibPuzzleCollectionId: number | null
}
