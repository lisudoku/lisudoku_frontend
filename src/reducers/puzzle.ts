import _ from 'lodash'
import { createSlice } from '@reduxjs/toolkit'
import formatISO from 'date-fns/formatISO'
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
  data: Puzzle | null,
  grid: Grid | null,
  notes: number[][][] | null,
  solveTimer: number,
  solved: boolean,
  lastUpdate: string | null,
  controls: ControlsState,
}

export const puzzleSlice = createSlice({
  name: 'puzzle',
  initialState: {
    data: null,
    grid: null,
    notes: null,
    solveTimer: 0,
    solved: false,
    lastUpdate: null,
    controls: {
      selectedCell: null,
      notesActive: false,
      actions: [],
    },
  } as PuzzleState,
  reducers: {
    requestedPuzzle(state) {
      state.grid = null
      state.notes = null
      state.data = null
      state.solved = false
    },
    receivedPuzzle(state, action) {
      const puzzleData: Puzzle = jcc.camelCaseKeys(action.payload)
      state.data = puzzleData
      state.solved = false
      state.solveTimer = 0
      state.lastUpdate = formatISO(new Date())

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

      state.lastUpdate = formatISO(new Date())
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

      state.lastUpdate = formatISO(new Date())
    },
    toggleNotesActive(state) {
      state.controls.notesActive = !state.controls.notesActive
    },
    updateTimer(state) {
      state.solveTimer += 1
    },
    requestSolved() {},
    responseSolved(state, action) {
      state.solved = action.payload
      state.lastUpdate = formatISO(new Date())
    },
  }
})

export const {
  requestedPuzzle, receivedPuzzle, changeSelectedCell, changeSelectedCellValue,
  changeSelectedCellNotes, toggleNotesActive, updateTimer, requestSolved, responseSolved,
} = puzzleSlice.actions

export default puzzleSlice.reducer
