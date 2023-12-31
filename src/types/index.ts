import { FixedNumber, Puzzle, SudokuVariant } from './sudoku'

export type ExtendedPuzzle = Puzzle & {
  solved: boolean;
}

export enum TrainerTechnique {
  HiddenSingle = 'HiddenSingle',
  NakedSingle = 'NakedSingle',
  Singles = 'singles',
}

export type TrainerPuzzle = {
  id: number
  variant: SudokuVariant
  technique: TrainerTechnique
  grid: string
  solutions: FixedNumber[]
  puzzlePublicId: string
}

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
