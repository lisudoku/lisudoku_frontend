import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import {
  CellPosition, FixedNumber, Puzzle, SudokuConstraints,
  SudokuDifficulty, SudokuVariant, Thermo,
} from 'src/types/sudoku'
import { SudokuBruteSolveResult, SudokuIntuitiveSolveResult } from 'src/types/wasm'
import { ensureDefaultRegions } from 'src/utils/sudoku'
const jcc = require('json-case-convertor')

export enum ConstraintType {
  FixedNumber = 'fixed_number',
  Thermo = 'thermo',
}

type AdminState = {
  puzzles: Puzzle[]
  constraints: SudokuConstraints | null
  variant: SudokuVariant
  difficulty: SudokuDifficulty
  constraintType: ConstraintType
  notesActive: boolean
  notes: number[][][] | null
  bruteSolution: SudokuBruteSolveResult | null
  intuitiveSolution: SudokuIntuitiveSolveResult | null
  solverRunning: boolean
  puzzlePublicId: string | null
  puzzleAdding: boolean
  selectedCell: CellPosition | null
  currentThermo: Thermo
}

const defaultDifficulty = (gridSize: number) => {
  switch (gridSize) {
    case 4: return SudokuDifficulty.Easy4x4
    case 6: return SudokuDifficulty.Easy6x6
    default: return SudokuDifficulty.Easy9x9
  }
}

const areAdjacent = (cell1: CellPosition, cell2: CellPosition) => {
  return Math.abs(cell1.row - cell2.row) <= 1 &&
         Math.abs(cell1.col - cell2.col) <= 1
}

const isCellInThermo = (thermo: Thermo, cell: CellPosition) => (
  thermo.find(thermoCell => _.isEqual(thermoCell, cell))
)

const expandsThermo = (thermo: Thermo, cell: CellPosition) => {
  if (thermo.length === 0) {
    return true
  }

  if (isCellInThermo(thermo, cell)) {
    return false
  }

  const lastCell = thermo[thermo.length - 1]
  return areAdjacent(lastCell, cell)
}

const handleConstraintChange = (state: AdminState) => {
  state.variant = detectVariant(state)
  state.bruteSolution = null
  state.intuitiveSolution = null
}

const detectVariant = (state: AdminState) => {
  const usedConstraints = _.compact([ _.gt(state.constraints?.thermos?.length, 0) ])
  if (usedConstraints.length > 1) {
    return SudokuVariant.Mixed
  }
  if (_.gt(state.constraints?.thermos?.length, 0)) {
    return SudokuVariant.Thermo
  }
  return SudokuVariant.Classic
}

export const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    puzzles: [],
    constraints: null,
    variant: SudokuVariant.Classic,
    difficulty: SudokuDifficulty.Easy9x9,
    constraintType: ConstraintType.FixedNumber,
    notesActive: false,
    notes: null,
    bruteSolution: null,
    intuitiveSolution: null,
    solverRunning: false,
    puzzlePublicId: null,
    puzzleAdding: false,
    selectedCell: null,
    currentThermo: [],
  } as AdminState,
  reducers: {
    initPuzzle(state, action) {
      const gridSize = Number.parseInt(action.payload)
      state.constraints = {
        gridSize,
        fixedNumbers: [],
        regions: ensureDefaultRegions(gridSize),
        thermos: [],
      }
      state.difficulty = defaultDifficulty(gridSize)
      state.notes = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))
    },
    changeSelectedCell(state, action) {
      state.selectedCell = action.payload

      switch (state.constraintType) {
        case ConstraintType.Thermo: {
          if (expandsThermo(state.currentThermo, action.payload)) {
            state.currentThermo.push(action.payload)
          }
          break
        }
      }

      handleConstraintChange(state)
    },
    changeConstraintType(state, action) {
      state.constraintType = action.payload
      state.selectedCell = null
      state.currentThermo = []
      handleConstraintChange(state)
    },
    changeSelectedCellValue(state, action) {
      const fixedNumber: FixedNumber = {
        position: state.selectedCell!,
        value: action.payload,
      }
      switch (state.constraintType) {
        case ConstraintType.FixedNumber: {
          const predicate = (existingFixedNumber: FixedNumber) => (
            _.isEqual(existingFixedNumber.position, fixedNumber.position)
          )
          const existingFixedNumber = state.constraints!.fixedNumbers.find(predicate)
          if (existingFixedNumber) {
            _.remove(state.constraints!.fixedNumbers, predicate)
            if (existingFixedNumber.value !== fixedNumber.value) {
              state.constraints!.fixedNumbers.push(fixedNumber)
            }
          } else {
            state.constraints!.fixedNumbers.push(fixedNumber)
          }
          break
        }
      }

      handleConstraintChange(state)
    },
    addConstraint(state) {
      switch (state.constraintType) {
        case ConstraintType.Thermo: {
          if (_.inRange(state.currentThermo.length, 2, state.constraints!.gridSize + 1)) {
            state.constraints!.thermos!.push(state.currentThermo)
            state.currentThermo = []
          }
          break
        }
      }

      handleConstraintChange(state)
    },
    deleteConstraint(state) {
      const cell = state.selectedCell

      _.remove(
        state.constraints!.fixedNumbers,
        (existingFixedNumber: FixedNumber) => _.isEqual(existingFixedNumber.position, cell)
      )

      const thermoPredicate = (thermoCell: CellPosition) => _.isEqual(thermoCell, cell)
      if (state.currentThermo.find(thermoPredicate)) {
        state.currentThermo = []
      }

      const index = _.findIndex(state.constraints!.thermos, (thermo: Thermo) => thermo.some(thermoPredicate))
      if (index !== -1) {
        state.constraints!.thermos?.splice(index, 1)
      }
    },
    requestSolution(state) {
      state.solverRunning = true
      state.puzzlePublicId = null
    },
    responseBruteSolution(state, action) {
      state.bruteSolution = action.payload
      state.solverRunning = false
    },
    responseIntuitiveSolution(state, action) {
      state.intuitiveSolution = action.payload
      state.solverRunning = false
    },
    errorSolution(state) {
      state.solverRunning = false
    },
    changeDifficulty(state, action) {
      state.difficulty = action.payload
    },
    requestAddPuzzle(state) {
      state.puzzleAdding = true
    },
    responseAddPuzzle(state, action) {
      state.puzzleAdding = false
      state.puzzlePublicId = action.payload
    },
    errorAddPuzzle(state) {
      state.puzzleAdding = false
    },
    responsePuzzles(state, action) {
      state.puzzles = action.payload.map((puzzle: Puzzle) => jcc.camelCaseKeys(puzzle))
    },
    toggleNotesActive(state) {
      state.notesActive = !state.notesActive
    },
    changeSelectedCellNotes(state, action) {
      if (state.selectedCell === null) {
        return
      }

      const { row, col } = state.selectedCell

      state.notes![row][col] = _.xor(state.notes![row][col], [action.payload])
    },
  },
})

export const {
  initPuzzle, changeSelectedCell, changeConstraintType, changeSelectedCellValue,
  addConstraint, deleteConstraint, requestSolution, responseBruteSolution,
  responseIntuitiveSolution, errorSolution, changeDifficulty,
  requestAddPuzzle, responseAddPuzzle, errorAddPuzzle, responsePuzzles,
  toggleNotesActive, changeSelectedCellNotes,
} = adminSlice.actions

export default adminSlice.reducer
