import { CellPosition, FixedNumber, Puzzle, SudokuVariant } from './sudoku'

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

export enum ActionType {
  Digit = 'digit',
  CornerMark = 'corner_mark',
  CenterMark = 'center_mark',
  Delete = 'delete',
}

export type UserSolutionStep = {
  type: ActionType
  value: number // digit
  time: number // seconds from start
  cells: CellPosition[]
}

export type UserSolution = {
  id?: number
  puzzle: Pick<Puzzle, 'publicId' | 'variant' | 'difficulty'>
  steps?: UserSolutionStep[]
  createdAt?: string
  solveTime?: number // seconds
}
