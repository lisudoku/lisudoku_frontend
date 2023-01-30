import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import {
  CellPosition, FixedNumber, Grid, KillerCage, KropkiDot, KropkiDotType, Puzzle, Region, SudokuConstraints,
  SudokuDifficulty, SudokuVariant, Thermo,
} from 'src/types/sudoku'
import { SudokuBruteSolveResult, SudokuIntuitiveSolveResult } from 'src/types/wasm'
import { ensureDefaultRegions } from 'src/utils/sudoku'
const jcc = require('json-case-convertor')

export enum ConstraintType {
  FixedNumber = 'fixed_number',
  Thermo = 'thermo',
  Regions = 'regions',
  Killer = 'killer',
  Kropki = 'kropki',
}

// TODO: split into separate reducers
type AdminState = {
  inputActive: boolean
  puzzles: Puzzle[]
  sourceCollectionId: string
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
  regionsGrid: Grid | null
  killerSum: number | null
  killerGrid: Grid | null
  kropkiGrid: Grid | null
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
  const variants = []
  if (!_.isEmpty(state.constraints?.thermos)) {
    variants.push(SudokuVariant.Thermo)
  }
  if (state.constraints?.primaryDiagonal || state.constraints?.secondaryDiagonal) {
    variants.push(SudokuVariant.Diagonal)
  }
  if (state.constraints?.antiKnight) {
    variants.push(SudokuVariant.AntiKnight)
  }
  if (!_.isEqual(state.constraints?.regions, ensureDefaultRegions(state.constraints!.gridSize))) {
    variants.push(SudokuVariant.Irregular)
  }
  if (!_.isEmpty(state.constraints?.killerCages)) {
    variants.push(SudokuVariant.Killer)
  }
  if (!_.isEmpty(state.constraints?.kropkiDots)) {
    variants.push(SudokuVariant.Kropki)
  }
  if (variants.length > 1) {
    return SudokuVariant.Mixed
  } else if (variants.length === 1) {
    return variants[0]
  } else {
    return SudokuVariant.Classic
  }
}

export const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    inputActive: false,
    puzzles: [],
    sourceCollectionId: '',
    constraints: null,
    variant: SudokuVariant.Classic,
    difficulty: SudokuDifficulty.Easy9x9,
    constraintType: ConstraintType.FixedNumber,
    notesActive: false,
    notes: null,
    bruteSolution: null,
    intuitiveSolution: null,
    solverRunning: false,
    sourceName: '',
    sourceUrl: '',
    puzzlePublicId: null,
    puzzleAdding: false,
    selectedCell: null,
    currentThermo: [],
    regionsGrid: null,
    killerSum: null,
    killerGrid: null,
    kropkiGrid: null,
  } as AdminState,
  reducers: {
    initPuzzle(state, action) {
      const gridSize = Number.parseInt(action.payload)
      state.constraints = {
        gridSize,
        fixedNumbers: [],
        regions: ensureDefaultRegions(gridSize),
        thermos: [],
        killerCages: [],
        kropkiDots: [],
        kropkiNegative: false,
        primaryDiagonal: false,
        secondaryDiagonal: false,
        antiKnight: false,
      }
      state.difficulty = defaultDifficulty(gridSize)
      state.notes = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => []))
      state.regionsGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
      state.constraints.regions.forEach((region, index) => {
        region.forEach(({ row, col }) => {
          state.regionsGrid![row][col] = index + 1
        })
      })
      state.killerGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
      state.kropkiGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
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
        case ConstraintType.Regions: {
          const regions: Region[] = []
          _.times(state.constraints!.gridSize, row => {
            _.times(state.constraints!.gridSize, col => {
              const regionIndex = state.regionsGrid![row][col]! - 1
              regions[regionIndex] ||= []
              const cell: CellPosition = { row, col }
              regions[regionIndex].push(cell)
            })
          })
          state.constraints!.regions = regions
          break
        }
        case ConstraintType.Killer: {
          const region: Region = []
          _.times(state.constraints!.gridSize, row => {
            _.times(state.constraints!.gridSize, col => {
              const value = state.killerGrid![row][col]
              if (value) {
                const cell: CellPosition = { row, col }
                region.push(cell)
              }
            })
          })
          const killerCage: KillerCage = {
            sum: state.killerSum!,
            region,
          }
          state.constraints!.killerCages!.push(killerCage)
          state.killerSum = null
          const gridSize = state.constraints!.gridSize
          state.killerGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
          break
        }
        case ConstraintType.Kropki: {
          const cells: CellPosition[] = []
          let cellsValue = 0
          _.times(state.constraints!.gridSize, row => {
            _.times(state.constraints!.gridSize, col => {
              const value = state.kropkiGrid![row][col]
              if (value) {
                const cell: CellPosition = { row, col }
                cells.push(cell)
                console.assert(cellsValue === 0 || cellsValue === value, 'cell value different')
                cellsValue = value
              }
            })
          })
          console.assert(cellsValue !== 0, 'no cell value found')
          console.assert(cells.length === 2, 'we need exact 2 cells')
          console.assert(
            Math.abs(cells[0].row - cells[1].row) + Math.abs(cells[0].col - cells[1].col) === 1,
            'cells need to be adjacent'
          )
          const kropkiDot: KropkiDot = {
            dotType: cellsValue === 1 ? KropkiDotType.Consecutive : KropkiDotType.Double,
            cell1: cells[0],
            cell2: cells[1],
          }
          state.constraints!.kropkiDots!.push(kropkiDot)
          const gridSize = state.constraints!.gridSize
          state.kropkiGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
          break
        }
      }

      handleConstraintChange(state)
    },
    deleteConstraint(state) {
      const cell = state.selectedCell
      if (!cell) {
        return
      }

      // Fixed numbers
      _.remove(
        state.constraints!.fixedNumbers,
        (existingFixedNumber: FixedNumber) => _.isEqual(existingFixedNumber.position, cell)
      )

      // Thermo
      const thermoPredicate = (thermoCell: CellPosition) => _.isEqual(thermoCell, cell)
      if (state.currentThermo.find(thermoPredicate)) {
        state.currentThermo = []
      }

      const thermoIndex = _.findIndex(state.constraints!.thermos, (thermo: Thermo) => thermo.some(thermoPredicate))
      if (thermoIndex !== -1) {
        state.constraints!.thermos?.splice(thermoIndex, 1)
      }

      // Killer
      const killerPredicate = (killerCell: CellPosition) => _.isEqual(killerCell, cell)
      state.killerGrid![cell.row][cell.col] = null

      const killerIndex = _.findIndex(state.constraints!.killerCages, (killerCage: KillerCage) => killerCage.region.some(killerPredicate))
      if (killerIndex !== -1) {
        state.constraints!.killerCages?.splice(killerIndex, 1)
      }

      // Kropki
      state.kropkiGrid![cell.row][cell.col] = null
      _.remove(state.constraints!.kropkiDots, kropkiDot => (
        _.isEqual(kropkiDot.cell1, cell) || _.isEqual(kropkiDot.cell2, cell)
      ))
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
      state.puzzlePublicId = null
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
    changeSelectedCellRegion(state, action) {
      if (state.selectedCell === null) {
        return
      }

      const { row, col } = state.selectedCell
      state.regionsGrid![row][col] = action.payload
    },
    changeSelectedCellKiller(state, action) {
      if (state.selectedCell === null) {
        return
      }

      const { row, col } = state.selectedCell
      state.killerGrid![row][col] = action.payload
    },
    changeSelectedCellKropki(state, action) {
      if (state.selectedCell === null) {
        return
      }

      const { row, col } = state.selectedCell
      state.kropkiGrid![row][col] = action.payload
    },
    deletePuzzle(state, action) {
      state.puzzles = state.puzzles.filter(puzzle => puzzle.id !== action.payload)
    },
    changePrimaryDiagonal(state, action) {
      state.constraints!.primaryDiagonal = action.payload
      handleConstraintChange(state)
    },
    changeSecondaryDiagonal(state, action) {
      state.constraints!.secondaryDiagonal = action.payload
      handleConstraintChange(state)
    },
    changeAntiKnight(state, action) {
      state.constraints!.antiKnight = action.payload
      handleConstraintChange(state)
    },
    changeKillerSum(state, action) {
      state.killerSum = action.payload
      handleConstraintChange(state)
    },
    changeKropkiNegative(state, action) {
      state.constraints!.kropkiNegative = action.payload
      handleConstraintChange(state)
    },
    changeSourceCollectionId(state, action) {
      state.sourceCollectionId = action.payload
    },
    changeInputActive(state, action) {
      state.inputActive = action.payload
    },
  },
})

export const {
  initPuzzle, changeSelectedCell, changeConstraintType, changeSelectedCellValue,
  addConstraint, deleteConstraint, requestSolution, responseBruteSolution,
  responseIntuitiveSolution, errorSolution, changeDifficulty,
  requestAddPuzzle, responseAddPuzzle, errorAddPuzzle, responsePuzzles,
  toggleNotesActive, changeSelectedCellNotes, deletePuzzle,
  changePrimaryDiagonal, changeSecondaryDiagonal, changeAntiKnight, changeSelectedCellRegion,
  changeKillerSum, changeSelectedCellKiller, changeSelectedCellKropki, changeKropkiNegative,
  changeInputActive, changeSourceCollectionId,
} = adminSlice.actions

export default adminSlice.reducer
