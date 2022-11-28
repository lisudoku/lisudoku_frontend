import { createSlice } from '@reduxjs/toolkit'
import { CellPosition, Grid, SudokuConstraints, SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { ensureDefaultRegions } from 'src/utils/sudoku'

type GroupCount = {
  variant: SudokuVariant,
  difficulty: SudokuDifficulty,
  count: number,
}

type Puzzle = {
  constraints: SudokuConstraints,
  grid: Grid,
  notes: number[][][],
  selectedCell: CellPosition | null,
}

type AdminState = {
  groupCounts: GroupCount[],
  puzzle: Puzzle | null,
}

export const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    groupCounts: [],
    puzzle: null,
  } as AdminState,
  reducers: {
    requestGroupCounts(state) {
      state.groupCounts = []
    },
    responseGroupCounts(state, action) {
      state.groupCounts = action.payload
    },
    initPuzzle(state, action) {
      const gridSize = Number.parseInt(action.payload)
      const constraints: SudokuConstraints = {
        gridSize,
        fixedNumbers: [],
        regions: ensureDefaultRegions(gridSize),
      }

      const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
      const notes = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))

      state.puzzle = {
        constraints,
        grid,
        notes,
        selectedCell: null,
      }
    },
    changeSelectedCell(state, action) {
      state.puzzle!.selectedCell = action.payload
    },
  },
})

export const {
  requestGroupCounts, responseGroupCounts, initPuzzle, changeSelectedCell,
} = adminSlice.actions

export default adminSlice.reducer
