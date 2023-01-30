import { Puzzle } from './sudoku'

export type PuzzleCollection = {
  id: number
  name: string
  url: string
  puzzles: Puzzle[]
}
