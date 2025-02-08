import { UserSolution } from './types'
import { SudokuDifficulty, SudokuVariant } from './types/sudoku'

export const migrateStore = (state: any) => {
  try {
    if (state?.userData?.solvedPuzzles?.some((puzzleSolve: any) => puzzleSolve.variant !== undefined)) {
      console.log('Running migration!')
      // previous data type
      type SolvedPuzzle = {
        id: string
        variant: SudokuVariant
        difficulty: SudokuDifficulty
        solveTime: number
      }
      return Promise.resolve({
        ...state,
        userData: {
          ...state.userData,
          solvedPuzzles: state.userData.solvedPuzzles.map((puzzleSolve: SolvedPuzzle): UserSolution => ({
            id: undefined,
            puzzle: {
              publicId: puzzleSolve.id,
              variant: puzzleSolve.variant,
              difficulty: puzzleSolve.difficulty,
            },
            steps: undefined,
            createdAt: undefined,
            solveTime: puzzleSolve.solveTime,
          }))
        },
      })
    }
    return Promise.resolve(state)
  }
  catch {
    console.log('Migration error, resetting user solves')
    return Promise.resolve({
      ...state,
      userData: {
        ...state.userData,
        solvedPuzzles: [],
      },
    })
  }
}
