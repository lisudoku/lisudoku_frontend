import { useMemo } from 'react'
import type { SudokuConstraints } from 'lisudoku-solver'
import type { CellMarks, Grid } from 'src/types/sudoku'
import { computeErrors } from 'src/utils/sudoku'

export const useCellMarkErrors = (
  checkErrors: boolean, constraints: SudokuConstraints, grid?: Grid, cellMarks?: CellMarks[][]
) => (
  useMemo(() => (
    computeErrors(checkErrors, constraints, grid, cellMarks).cellMarksErrors
  ), [checkErrors, constraints, grid, cellMarks])
)
