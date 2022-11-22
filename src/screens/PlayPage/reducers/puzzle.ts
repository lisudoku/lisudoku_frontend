import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import { CellPosition, Grid, Puzzle } from 'src/types/sudoku'
import { computeFixedNumbersGrid } from 'src/utils/sudoku'
const jcc = require('json-case-convertor')

type Action = {
  // TBD
}

type ControlsState = {
  selectedCell: CellPosition | null,
  notesActive: boolean,
  actions: Action[],
}

type PuzzleState = {
  isLoading: boolean,
  data: Puzzle | null,
  grid: Grid | null,
  notes: number[][][] | null,
  solveTimer: number,
  isSolvedLoading: boolean,
  solved: boolean,
  controls: ControlsState,
}

export const puzzleSlice = createSlice({
  name: 'puzzle',
  initialState: {
    isLoading: false,
    data: null,
    grid: null,
    notes: null,
    solveTimer: 0,
    isSolvedLoading: false,
    solved: false,
    controls: {
      selectedCell: null,
      notesActive: false,
      actions: [],
    },
  } as PuzzleState,
  reducers: {
    requestedPuzzle(state) {
      state.isLoading = true
    },
    receivedPuzzle(state, action) {
      const puzzleData: Puzzle = jcc.camelCaseKeys(action.payload)
      state.data = puzzleData
      state.isLoading = false
      state.solved = false
      state.solveTimer = 0

      const { gridSize, fixedNumbers } = puzzleData.constraints
      const fixedNumbersGrid = computeFixedNumbersGrid(gridSize, fixedNumbers)
      state.grid = Array(gridSize).fill(null).map((_row, rowIndex) => Array(gridSize).fill(null).map((_col, colIndex) => (fixedNumbersGrid[rowIndex][colIndex])))

      state.notes = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))
    },
    changeSelectedCell: (state, action) => {
      state.controls.selectedCell = action.payload
    },
    changeSelectedCellValue(state, action) {
      if (state.controls.selectedCell === null) {
        return
      }

      const value = action.payload
      const { row, col } = state.controls.selectedCell
      const newGrid: Grid = [ ...state.grid! ]
      newGrid[row] = [ ...newGrid[row] ]
      if (newGrid[row][col] === value) {
        newGrid[row][col] = null
      } else {
        newGrid[row][col] = value
      }
      state.grid = newGrid
    },
    changeSelectedCellNotes(state, action) {
      if (state.controls.selectedCell === null) {
        return
      }

      const value = action.payload
      const { row, col } = state.controls.selectedCell

      if (value !== null && state.grid![row][col] !== null) {
        return
      }

      const newNotes = [ ...state.notes! ]
      newNotes[row] = [ ...newNotes[row] ]
      if (value === null) {
        newNotes[row][col] = []
      } else if (newNotes[row][col].includes(value)) {
        newNotes[row][col] = _.without(newNotes[row][col], value)
      } else {
        newNotes[row][col] = [ ...newNotes[row][col], value ]
      }

      if (!_.isEqual(state.notes, newNotes)) {
        state.notes = newNotes
      }
    },
    toggleNotesActive(state) {
      state.controls.notesActive = !state.controls.notesActive
    },
    updateTimer(state) {
      state.solveTimer += 1
    },
    requestSolved(state) {
      state.isSolvedLoading = true
    },
    responseSolved(state, action) {
      state.isSolvedLoading = false
      state.solved = action.payload
    },
  }
})

export const {
  requestedPuzzle, receivedPuzzle, changeSelectedCell, changeSelectedCellValue,
  changeSelectedCellNotes, toggleNotesActive, updateTimer, requestSolved, responseSolved,
} = puzzleSlice.actions

export default puzzleSlice.reducer
