import type { SudokuBruteSolveResult, SudokuLogicalSolveResult } from 'lisudoku-solver'
import { SolverType } from 'src/types/wasm'

export type WorkerSolutionResponse =
  | { solverType: SolverType.Brute, solution: SudokuBruteSolveResult, error?: never }
  | { solverType: SolverType.Brute, solution?: never, error: string }
  | { solverType: SolverType.Logical, solution: SudokuLogicalSolveResult, error?: never }
  | { solverType: SolverType.Logical, solution?: never, error: string }
