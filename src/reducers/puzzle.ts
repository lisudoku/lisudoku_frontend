import _ from 'lodash'
import { createSlice } from '@reduxjs/toolkit'
import formatISO from 'date-fns/formatISO'
import { CellPosition, Grid, Puzzle } from 'src/types/sudoku'
import { computeFixedNumbersGrid } from 'src/utils/sudoku'
import { SudokuLogicalSolveResult } from 'src/types/wasm'
const jcc = require('json-case-convertor')

export enum ActionType {
  Digit = 'digit',
  Note = 'note',
  Delete = 'delete',
}

export enum HintLevel {
  Small = 'Small',
  Big = 'Big',
  Full = 'Full',
}

type UserAction = {
  type: ActionType
  cells: CellPosition[]
  value: number
  previousDigits: (number | null)[]
  previousNotes: number[][]
  time: number
}

type ControlsState = {
  selectedCells: CellPosition[]
  notesActive: boolean
  actions: UserAction[]
  actionIndex: number
  hintSolution: SudokuLogicalSolveResult | null
  lastHint: string | null
  hintLevel: HintLevel | null
  paused: boolean
}

type PuzzleState = {
  data: Puzzle | null
  grid: Grid | null
  notes: number[][][] | null
  solveTimer: number
  solved: boolean
  lastUpdate: string | null
  refreshKey: number
  controls: ControlsState
}

const performAction = (state: PuzzleState, action: UserAction) => {
  for (const { row, col } of action.cells) {
    switch(action.type) {
      case ActionType.Digit: state.grid![row][col] = action.value
                             break
      case ActionType.Note: state.notes![row][col] = _.xor(state.notes![row][col], [action.value])
                            break
      case ActionType.Delete: state.grid![row][col] = null
                              state.notes![row][col] = []
                              break
    }
  }
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
    refreshKey: 0,
    controls: {
      selectedCells: [],
      notesActive: false,
      actions: [],
      actionIndex: -1,
      hintSolution: null,
      lastHint: null,
      hintLevel: null,
      paused: false,
    },
  } as PuzzleState,
  reducers: {
    requestedPuzzle(_state) {
    },
    receivedPuzzle(state, action) {
      const puzzleData: Puzzle = jcc.camelCaseKeys(action.payload)
      puzzleData.constraints.killerCages ||= []
      state.data = puzzleData
      state.solved = false
      state.solveTimer = 0
      state.lastUpdate = formatISO(new Date())
      state.controls.selectedCells = []
      state.controls.actions = []
      state.controls.actionIndex = -1
      state.controls.hintSolution = null
      state.controls.lastHint = null
      state.controls.hintLevel = null
      state.controls.paused = false
      state.controls.notesActive = false

      const { gridSize, fixedNumbers } = puzzleData.constraints
      const fixedNumbersGrid = computeFixedNumbersGrid(gridSize, fixedNumbers)
      state.grid = Array(gridSize).fill(null).map((_row, rowIndex) => Array(gridSize).fill(null).map((_col, colIndex) => (fixedNumbersGrid[rowIndex][colIndex])))

      state.notes = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))
    },
    clearPuzzle(state) {
      state.data = null
      state.lastUpdate = null
    },
    changeSelectedCell: (state, action) => {
      const { cell, ctrl, isClick } = action.payload
      if (ctrl) {
        if (isClick) {
          state.controls.selectedCells = _.xorWith(state.controls.selectedCells, [ cell ], _.isEqual)
        } else {
          state.controls.selectedCells = _.uniqWith([ ...state.controls.selectedCells, cell ], _.isEqual)
        }
      } else {
        state.controls.selectedCells = [ cell ]
      }
    },
    changeSelectedCellValue(state, action) {
      if (_.isEmpty(state.controls.selectedCells)) {
        return
      }

      const value = action.payload
      const actionType = value === null ? ActionType.Delete : ActionType.Digit
      const cells = _.differenceWith(
        state.controls.selectedCells, _.map(state.data!.constraints.fixedNumbers, 'position'), _.isEqual
      )

      const allHaveValue = cells.every(
        ({ row, col }) => state.grid![row][col] === value
      )

      let relevantCells
      let newValue
      if (value === null || allHaveValue) {
        relevantCells = cells
        newValue = null
      } else {
        relevantCells = cells.filter(({ row, col }) => state.grid![row][col] !== value)
        newValue = value
      }

      const userAction: UserAction = {
        type: actionType,
        cells: relevantCells,
        value: newValue,
        previousDigits: relevantCells.map(({ row, col }) => state.grid![row][col]),
        previousNotes: relevantCells.map(({ row, col }) => state.notes![row][col]),
        time: state.solveTimer,
      }

      performAction(state, userAction)

      state.controls.actions.push(userAction)
      state.controls.actionIndex = state.controls.actions.length - 1

      state.controls.hintSolution = null
      state.controls.hintLevel = null
      state.lastUpdate = formatISO(new Date())
    },
    changeSelectedCellNotes(state, action) {
      if (_.isEmpty(state.controls.selectedCells)) {
        return
      }

      const value = action.payload
      const cells = _.differenceWith(
        state.controls.selectedCells, _.map(state.data!.constraints.fixedNumbers, 'position'), _.isEqual
      )

      const allHaveValue = cells.every(
        ({ row, col }) => state.notes![row][col].includes(value)
      )

      let relevantCells
      if (allHaveValue) {
        relevantCells = cells
      } else {
        relevantCells = cells.filter(({ row, col }) => !state.notes![row][col].includes(value))
      }

      const userAction: UserAction = {
        type: ActionType.Note,
        cells: relevantCells,
        value,
        previousDigits: relevantCells.map(({ row, col }) => state.grid![row][col]),
        previousNotes: relevantCells.map(({ row, col }) => state.notes![row][col]),
        time: state.solveTimer,
      }

      performAction(state, userAction)

      state.controls.actions.push(userAction)
      state.controls.actionIndex = state.controls.actions.length - 1

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
      state.solved = action.payload.solved
      state.lastUpdate = formatISO(new Date())
    },
    fetchNewPuzzle(state) {
      // This will trigger refetching the puzzle
      state.refreshKey += 1
      state.lastUpdate = null
    },
    resetPuzzle(state) {
      const { gridSize, fixedNumbers } = state.data!.constraints
      const fixedNumbersGrid = computeFixedNumbersGrid(gridSize, fixedNumbers)
      state.grid = Array(gridSize).fill(null).map((_row, rowIndex) => Array(gridSize).fill(null).map((_col, colIndex) => (fixedNumbersGrid[rowIndex][colIndex])))
      state.notes = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))
      state.controls.actions = []
      state.controls.actionIndex = -1
    },
    undoAction(state) {
      const actionIndex = state.controls.actionIndex
      const userAction: UserAction = state.controls.actions[actionIndex]
      state.controls.selectedCells = userAction.cells
      userAction.cells.forEach((cell, index) => {
        state.grid![cell.row][cell.col] = userAction.previousDigits[index]
        state.notes![cell.row][cell.col] = userAction.previousNotes[index]
      })
      state.controls.actionIndex--
    },
    redoAction(state) {
      state.controls.actionIndex++
      const actionIndex = state.controls.actionIndex
      const userAction: UserAction = state.controls.actions[actionIndex]
      state.controls.selectedCells = userAction.cells
      performAction(state, userAction)
    },
    changeHintSolution(state, action) {
      state.controls.hintSolution = action.payload
      state.controls.lastHint = formatISO(new Date())
      if (state.controls.hintSolution) {
        if (state.controls.hintLevel === null) {
          state.controls.hintLevel = HintLevel.Small
        } else if (state.controls.hintLevel === HintLevel.Small) {
          state.controls.hintLevel = HintLevel.Big
        }
      }
    },
    changeHintLevel(state, action) {
      state.controls.hintLevel = action.payload
    },
    changePaused(state, action) {
      state.controls.paused = action.payload
    },
  }
})

export const {
  requestedPuzzle, receivedPuzzle, clearPuzzle, changeSelectedCell, changeSelectedCellValue,
  changeSelectedCellNotes, toggleNotesActive, updateTimer, requestSolved, responseSolved,
  fetchNewPuzzle, resetPuzzle, undoAction, redoAction, changeHintSolution, changeHintLevel,
  changePaused,
} = puzzleSlice.actions

export default puzzleSlice.reducer
