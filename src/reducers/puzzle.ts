import { cloneDeep, differenceWith, inRange, isEmpty, isEqual, map, uniqWith, xor, xorWith } from 'lodash-es'
import { createSlice } from '@reduxjs/toolkit'
import formatISO from 'date-fns/formatISO'
import type { CellPosition, SudokuLogicalSolveResult } from 'lisudoku-solver'
import { CellMarks, Grid, Puzzle } from 'src/types/sudoku'
import { computeFixedNumbersGrid, defaultConstraints, getAllCells } from 'src/utils/sudoku'
import { camelCaseKeys } from 'src/utils/json'
import { ActionType } from 'src/types'

export enum HintLevel {
  Small = 'Small',
  Big = 'Big',
  Full = 'Full',
}

export enum InputMode {
  Numbers = 'numbers',
  CornerMarks = 'corner_marks',
  CenterMarks = 'center_marks',
}

const INPUT_MODE_ORDER = [ InputMode.Numbers, InputMode.CornerMarks, InputMode.CenterMarks ]

type UserAction = {
  type: ActionType
  cells: CellPosition[]
  value: number
  previousDigits: (number | null)[]
  previousCellMarks: CellMarks[]
  time: number
}

type ControlsState = {
  selectedCells: CellPosition[]
  inputMode: InputMode
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
  cellMarks: CellMarks[][] | null
  solveTimer: number
  solved: boolean | null
  solveStats: SolveStats | null
  lastUpdate: string | null
  lastUpdateTimer: number | null
  refreshKey: number
  controls: ControlsState
}

export const performAction = (
  state: Pick<PuzzleState, 'grid' | 'cellMarks'>,
  action: Pick<UserAction, 'type' | 'cells' | 'value'>,
) => {
  for (const { row, col } of action.cells) {
    switch(action.type) {
      case ActionType.Digit: state.grid![row][col] = action.value
                             break
      case ActionType.CornerMark: state.cellMarks![row][col].cornerMarks = xor(state.cellMarks![row][col].cornerMarks, [action.value])
                                  break
      case ActionType.CenterMark: state.cellMarks![row][col].centerMarks = xor(state.cellMarks![row][col].centerMarks, [action.value])
      break
      case ActionType.Delete: state.grid![row][col] = null
                              state.cellMarks![row][col] = {}
                              break
    }
  }
}

const insertAction = (state: PuzzleState, action: UserAction) => {
  state.controls.actions.splice(state.controls.actionIndex + 1)
  state.controls.actions.push(action)
  state.controls.actionIndex = state.controls.actions.length - 1
}

const handleChangeSelectedCellMarks = (state: PuzzleState, value: number, actionType: ActionType) => {
  if (isEmpty(state.controls.selectedCells)) {
    return
  }

  const markKey = actionType === ActionType.CornerMark ? 'cornerMarks' : 'centerMarks'

  const cells = differenceWith(
    state.controls.selectedCells, map(state.data?.constraints.fixedNumbers, 'position'), isEqual
  )

  const allHaveValue = cells.every(
    ({ row, col }) => state.cellMarks![row][col]?.[markKey]?.includes(value)
  )

  let relevantCells
  if (allHaveValue) {
    relevantCells = cells
  } else {
    relevantCells = cells.filter(({ row, col }) => !state.cellMarks![row][col]?.[markKey]?.includes(value))
  }

  if (!isEmpty(relevantCells)) {
    const userAction: UserAction = {
      type: actionType,
      cells: relevantCells,
      value,
      previousDigits: relevantCells.map(({ row, col }) => state.grid![row][col]),
      previousCellMarks: relevantCells.map(({ row, col }) => cloneDeep(state.cellMarks![row][col])),
      time: state.solveTimer,
    }

    performAction(state, userAction)

    insertAction(state, userAction)
  }

  markUpdate(state)
}

const markUpdate = (state: PuzzleState) => {
  state.lastUpdate = formatISO(new Date())
  state.lastUpdateTimer = state.solveTimer
  state.solved = null
  state.controls.hintSolution = null
  state.controls.hintLevel = null
}

const clearUpdate = (state: PuzzleState) => {
  state.lastUpdate = null
  state.lastUpdateTimer = null
  state.solved = null
  state.controls.actions = []
}

export const puzzleSlice = createSlice({
  name: 'puzzle',
  initialState: {
    data: null,
    grid: null,
    cellMarks: null,
    solveTimer: 0,
    solved: null,
    solveStats: null,
    lastUpdate: null,
    lastUpdateTimer: null,
    refreshKey: 0,
    controls: {
      selectedCells: [],
      inputMode: InputMode.Numbers,
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
      const puzzleData: Puzzle = camelCaseKeys(action.payload)
      puzzleData.constraints = {
        ...defaultConstraints(puzzleData.constraints.gridSize),
        ...puzzleData.constraints,
      }
      state.data = puzzleData
      state.solved = null
      state.solveStats = null
      state.solveTimer = 0
      markUpdate(state)
      state.controls.selectedCells = []
      state.controls.actions = []
      state.controls.actionIndex = -1
      state.controls.lastHintTimer = null
      state.controls.paused = false
      state.controls.inputMode = InputMode.Numbers;

      const { gridSize, fixedNumbers } = puzzleData.constraints
      const fixedNumbersGrid = computeFixedNumbersGrid(gridSize, fixedNumbers)
      state.grid = Array(gridSize).fill(null).map((_row, rowIndex) => Array(gridSize).fill(null).map((_col, colIndex) => (fixedNumbersGrid[rowIndex][colIndex])))

      state.cellMarks = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => ({})))
    },
    clearPuzzle(state) {
      state.data = null
      clearUpdate(state)
    },
    changeSelectedCell(state, action) {
      const { cell, ctrl, isClick, doubleClick } = action.payload
      if (ctrl) {
        if (isClick) {
          state.controls.selectedCells = xorWith(state.controls.selectedCells, [ cell ], isEqual)
        } else {
          state.controls.selectedCells = uniqWith([ ...state.controls.selectedCells, cell ], isEqual)
        }
      } else if (doubleClick) {
        const value = state.grid![cell.row][cell.col]
        // Note: the single-click is fired before, so if the there is no digit there
        // it will be selected
        if (value !== null) {
          const gridSize = state.data?.constraints.gridSize
          if (gridSize === undefined) {
            return
          }
          const cellsWithValue = getAllCells(gridSize).filter(c => (
            state.grid![c.row][c.col] === value
          ))
          state.controls.selectedCells = cellsWithValue
        }
      } else {
        state.controls.selectedCells = [ cell ]
      }
    },
    changeSelectedCellValue(state, action) {
      if (isEmpty(state.controls.selectedCells)) {
        return
      }

      const value = action.payload
      if (value !== null && !inRange(value, 1, state.data!.constraints.gridSize + 1)) {
        return
      }

      const actionType = value === null ? ActionType.Delete : ActionType.Digit
      const cells = differenceWith(
        state.controls.selectedCells, map(state.data?.constraints.fixedNumbers, 'position'), isEqual
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

      if (!isEmpty(relevantCells)) {
        const userAction: UserAction = {
          type: actionType,
          cells: relevantCells,
          value: newValue,
          previousDigits: relevantCells.map(({ row, col }) => state.grid![row][col]),
          previousCellMarks: relevantCells.map(({ row, col }) => cloneDeep(state.cellMarks![row][col])),
          time: state.solveTimer,
        }

        performAction(state, userAction)

        insertAction(state, userAction)
      }

      state.controls.hintSolution = null
      state.controls.hintLevel = null
      markUpdate(state)
    },
    changeSelectedCellCornerMarks(state, action) {
      handleChangeSelectedCellMarks(state, action.payload, ActionType.CornerMark)
    },
    changeSelectedCellCenterMarks(state, action) {
      handleChangeSelectedCellMarks(state, action.payload, ActionType.CenterMark)
    },
    changeInputMode(state, action) {
      state.controls.inputMode = action.payload
    },
    changeNextInputMode(state) {
      const index = INPUT_MODE_ORDER.indexOf(state.controls.inputMode)
      state.controls.inputMode = INPUT_MODE_ORDER[(index + 1) % INPUT_MODE_ORDER.length]
    },
    updateTimer(state) {
      state.solveTimer += 1
    },
    requestSolved(state) {
      state.solved = null
    },
    responseSolved(state, action) {
      markUpdate(state)
      state.solved = action.payload.solved
      state.solveStats = action.payload.solveStats
    },
    fetchNewPuzzle(state) {
      // This will trigger refetching the puzzle
      state.refreshKey += 1
      clearUpdate(state)
    },
    resetPuzzle(state) {
      const constraints = state.data?.constraints
      if (constraints === undefined) {
        return
      }
      const { gridSize, fixedNumbers } = constraints
      const fixedNumbersGrid = computeFixedNumbersGrid(gridSize, fixedNumbers)
      state.grid = Array(gridSize).fill(null).map((_row, rowIndex) => Array(gridSize).fill(null).map((_col, colIndex) => (fixedNumbersGrid[rowIndex][colIndex])))
      state.cellMarks = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => ({})))
      state.controls.actions = []
      state.controls.actionIndex = -1
    },
    undoAction(state) {
      if (state.controls.actionIndex < 0) {
        return
      }
      const actionIndex = state.controls.actionIndex
      const userAction: UserAction = state.controls.actions[actionIndex]
      state.controls.selectedCells = userAction.cells
      userAction.cells.forEach((cell, index) => {
        state.grid![cell.row][cell.col] = userAction.previousDigits[index]
        state.cellMarks![cell.row][cell.col] = userAction.previousCellMarks[index]
      })
      state.controls.actionIndex--
      markUpdate(state)
    },
    redoAction(state) {
      if (state.controls.actionIndex + 1 >= state.controls.actions.length) {
        return
      }
      state.controls.actionIndex++
      const actionIndex = state.controls.actionIndex
      const userAction: UserAction = state.controls.actions[actionIndex]
      state.controls.selectedCells = userAction.cells
      performAction(state, userAction)
      markUpdate(state)
    },
    changeHintSolution(state, action) {
      state.controls.hintSolution = action.payload
      state.controls.lastHintTimer = state.solveTimer
      if (state.controls.hintSolution && state.controls.hintSolution.solutionType !== 'None') {
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
  changeSelectedCellCornerMarks, changeSelectedCellCenterMarks, changeInputMode, changeNextInputMode,
  updateTimer, requestSolved, responseSolved,
  fetchNewPuzzle, resetPuzzle, undoAction, redoAction, changeHintSolution, changeHintLevel,
  changePaused,
} = puzzleSlice.actions

export default puzzleSlice.reducer
