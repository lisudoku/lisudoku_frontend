import _ from 'lodash'
import { createSlice } from '@reduxjs/toolkit'
import formatISO from 'date-fns/formatISO'
import { CellPosition, Grid, Puzzle } from 'src/types/sudoku'
import { computeFixedNumbersGrid, getAllCells } from 'src/utils/sudoku'
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
  lastHintTimer: number | null
  hintLevel: HintLevel | null
  paused: boolean
}

type SolveStats = {
  median: number
  count: number
  rank: number
}

type PuzzleState = {
  data: Puzzle | null
  grid: Grid | null
  notes: number[][][] | null
  solveTimer: number
  solved: boolean | null
  solveStats: SolveStats | null
  lastUpdate: string | null
  lastUpdateTimer: number | null
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

const markUpdate = (state: PuzzleState) => {
  state.lastUpdate = formatISO(new Date())
  state.lastUpdateTimer = state.solveTimer
}

const clearUpdate = (state: PuzzleState) => {
  state.lastUpdate = null
  state.lastUpdateTimer = null
}

export const puzzleSlice = createSlice({
  name: 'puzzle',
  initialState: {
    data: null,
    grid: null,
    notes: null,
    solveTimer: 0,
    solved: null,
    solveStats: null,
    lastUpdate: null,
    lastUpdateTimer: null,
    refreshKey: 0,
    controls: {
      selectedCells: [],
      notesActive: false,
      actions: [],
      actionIndex: -1,
      hintSolution: null,
      lastHintTimer: null,
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
      state.solved = null
      state.solveStats = null
      state.solveTimer = 0
      markUpdate(state)
      state.controls.selectedCells = []
      state.controls.actions = []
      state.controls.actionIndex = -1
      state.controls.hintSolution = null
      state.controls.lastHintTimer = null
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
      clearUpdate(state)
    },
    changeSelectedCell: (state, action) => {
      const { cell, ctrl, isClick, doubleClick } = action.payload
      if (ctrl) {
        if (isClick) {
          state.controls.selectedCells = _.xorWith(state.controls.selectedCells, [ cell ], _.isEqual)
        } else {
          state.controls.selectedCells = _.uniqWith([ ...state.controls.selectedCells, cell ], _.isEqual)
        }
      } else if (doubleClick) {
        const value = state.grid![cell.row][cell.col]
        // Note: the single-click is fired before, so if the there is no digit there
        // it will be selected
        if (value !== null) {
          const cellsWithValue = getAllCells(state.data!.constraints.gridSize).filter(c => (
            state.grid![c.row][c.col] === value
          ))
          state.controls.selectedCells = cellsWithValue
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

      if (!_.isEmpty(relevantCells)) {
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
      }

      state.controls.hintSolution = null
      state.controls.hintLevel = null
      markUpdate(state)
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

      if (!_.isEmpty(relevantCells)) {
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
      }

      markUpdate(state)
    },
    toggleNotesActive(state) {
      state.controls.notesActive = !state.controls.notesActive
    },
    updateTimer(state) {
      state.solveTimer += 1
    },
    requestSolved(state) {
      state.solved = null
    },
    responseSolved(state, action) {
      state.solved = action.payload.solved
      state.solveStats = action.payload.solveStats
      markUpdate(state)
    },
    fetchNewPuzzle(state) {
      // This will trigger refetching the puzzle
      state.refreshKey += 1
      clearUpdate(state)
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
      state.controls.lastHintTimer = state.solveTimer
      if (state.controls.hintSolution && state.controls.hintSolution.solution_type !== 'None') {
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
