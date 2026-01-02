import { useMemo } from 'react'
import type { SudokuConstraints } from 'lisudoku-solver'
import type { CellMarks, Grid } from 'src/types/sudoku'
import { computeErrors } from 'src/utils/sudoku'

export const useGridErrors = (
  checkErrors: boolean, constraints: SudokuConstraints, grid?: Grid, cellMarks?: CellMarks[][]
) => (
  useMemo(() => (
    computeErrors(checkErrors, constraints, grid, cellMarks).gridErrors
  ), [checkErrors, constraints, grid, cellMarks])
)
