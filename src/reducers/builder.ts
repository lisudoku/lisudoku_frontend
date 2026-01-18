import { createSlice } from '@reduxjs/toolkit'
import {
  compact,
  differenceWith, find, findIndex, isEmpty, isEqual,
  pull, pullAllWith, remove, sortBy, uniqWith, xorWith,
} from 'lodash-es'
import {
  CellMarks, ConstraintKeyType, ConstraintType, Grid,
  SudokuDifficulty, SudokuVariant,
} from 'src/types/sudoku'
import { SolverType } from 'src/types/wasm'
import { camelCaseKeys } from 'src/utils/json'
import { assert } from 'src/utils/misc'
import { defaultConstraints, detectConstraints, regionGridToRegions, regionsToRegionGrid } from 'src/utils/sudoku'
import { InputMode } from './puzzle'
import {
  Arrow, CellPosition, FixedNumber, KillerCage, KropkiDot, KropkiDotType, Palindrome, Region, Renban, SudokuBruteSolveResult, SudokuConstraints, SudokuLogicalSolveResult, Thermo,
} from 'lisudoku-solver'

export enum ArrowConstraintType {
  Circle = 'arrow-circle',
  Arrow = 'arrow-arrow',
}

// TODO: split into separate reducers
type BuilderState = {
  inputActive: boolean
  sourceCollectionId: string
  author: string
  constraints: SudokuConstraints | null
  variant: SudokuVariant
  difficulty: SudokuDifficulty
  constraintType: ConstraintType
  arrowConstraintType: ArrowConstraintType
  inputMode: InputMode
  cellMarks: CellMarks[][] | null
  bruteSolution: SudokuBruteSolveResult | null
  logicalSolution: SudokuLogicalSolveResult | null
  logicalSolutionStepIndex: number | null
  setterMode: boolean
  bruteSolverRunning: boolean
  logicalSolverRunning: boolean
  puzzlePublicId: string | null
  puzzleAdding: boolean
  selectedCells: CellPosition[]
  currentThermo: Thermo
  currentArrow: Arrow
  currentRenban: Renban
  currentPalindrome: Palindrome
  constraintGrid: Grid | null
  killerSum: number | null
  manualChange: boolean
}

const defaultDifficulty = (gridSize: number) => {
  switch (gridSize) {
    case 4: return SudokuDifficulty.Easy4x4
    case 6: return SudokuDifficulty.Easy6x6
    default: return SudokuDifficulty.Easy9x9
  }
}

const areAdjacent8 = (cell1: CellPosition, cell2: CellPosition) => {
  return Math.abs(cell1.row - cell2.row) <= 1 &&
         Math.abs(cell1.col - cell2.col) <= 1
}

const areAdjacent4 = (cell1: CellPosition, cell2: CellPosition) => {
  return Math.abs(cell1.row - cell2.row) + Math.abs(cell1.col - cell2.col) === 1
}

const isCellInPath = (thermo: Thermo, cell: CellPosition) => (
  thermo.find(thermoCell => isEqual(thermoCell, cell))
)

const expandsPath = (path: CellPosition[], cell: CellPosition) => {
  if (path.length === 0) {
    return true
  }

  if (isCellInPath(path, cell)) {
    return false
  }

  const lastCell = path[path.length - 1]
  return areAdjacent8(lastCell, cell)
}

const expandsArea = (area: CellPosition[], cell: CellPosition, areAdjacent: (c1: CellPosition, c2: CellPosition) => boolean) => {
  if (area.length === 0) {
    return true
  }

  if (isCellInPath(area, cell)) {
    return false
  }

  return area.some(areaCell => areAdjacent(areaCell, cell))
}

const expandsArea4 = (area: CellPosition[], cell: CellPosition) => expandsArea(area, cell, areAdjacent4)

const expandsArea8 = (area: CellPosition[], cell: CellPosition) => expandsArea(area, cell, areAdjacent8)

const handleConstraintChange = (state: BuilderState) => {
  state.variant = detectConstraints(state.constraints).variant
  state.bruteSolution = null
  state.logicalSolution = null
  state.manualChange = true
}

export const builderSlice = createSlice({
  name: 'builder',
  initialState: {
    inputActive: false,
    sourceCollectionId: '',
    author: '',
    constraints: null,
    variant: SudokuVariant.Classic,
    difficulty: SudokuDifficulty.Easy9x9,
    constraintType: ConstraintType.FixedNumber,
    arrowConstraintType: ArrowConstraintType.Circle,
    inputMode: InputMode.Numbers,
    cellMarks: null,
    bruteSolution: null,
    bruteSolverRunning: false,
    logicalSolution: null,
    logicalSolverRunning: false,
    logicalSolutionStepIndex: null,
    setterMode: false,
    sourceName: '',
    sourceUrl: '',
    puzzlePublicId: null,
    puzzleAdding: false,
    selectedCells: [],
    currentThermo: [],
    currentArrow: {
      circleCells: [],
      arrowCells: [],
    },
    currentRenban: [],
    currentPalindrome: [],
    killerSum: null,
    constraintGrid: null,
    manualChange: false,
  } as BuilderState,
  reducers: {
    initPuzzle(state, action) {
      const gridSize = Number.parseInt(action.payload.gridSize)
      state.constraints = defaultConstraints(gridSize)
      if (action.payload.setterMode !== undefined) {
        state.setterMode = action.payload.setterMode
      }
      state.difficulty = defaultDifficulty(gridSize)
      state.cellMarks = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => ({})))
      state.constraintGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
      state.bruteSolution = null
      state.logicalSolution = null
      state.manualChange = false
    },
    receivedPuzzle(state, action) {
      const constraints: Partial<SudokuConstraints> = camelCaseKeys(action.payload)
      const gridSize = constraints.gridSize!
      state.constraints = {
        ...defaultConstraints(gridSize),
        ...constraints,
      }
      state.difficulty = defaultDifficulty(gridSize)
      state.variant = detectConstraints(state.constraints).variant
      state.cellMarks = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => ({})))
      state.constraintGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
      state.bruteSolution = null
      state.logicalSolution = null
      state.manualChange = false
    },
    changeSelectedCell(state, action) {
      const { cell, ctrl, isClick } = action.payload
      if (ctrl) {
        if (isClick) {
          state.selectedCells = xorWith(state.selectedCells, [ cell ], isEqual)
        } else {
          state.selectedCells = uniqWith([ ...state.selectedCells, cell ], isEqual)
        }
      } else {
        // Passing a null cell will clear the selection
        state.selectedCells = compact([ cell ])
      }

      let anyConstraintsChanged = false
      for (const selectedCell of state.selectedCells) {
        const isSelectedCell = (cell: CellPosition) => isEqual(cell, selectedCell)

        let constraintChanged = true
        switch (state.constraintType) {
          case ConstraintType.Thermo: {
            if (expandsPath(state.currentThermo, cell)) {
              state.currentThermo.push(cell)
            }
            break
          }
          case ConstraintType.Arrow: {
            if (state.arrowConstraintType === ArrowConstraintType.Circle) {
              if (expandsArea4(state.currentArrow.circleCells, cell) && !find(state.currentArrow.arrowCells, cell)) {
                state.currentArrow.circleCells.push(cell)
              }
            } else {
              if (
                state.currentArrow.circleCells.length > 0 &&
                !find(state.currentArrow.circleCells, cell) &&
                (
                  (
                    state.currentArrow.arrowCells.length > 0 &&
                    expandsPath(state.currentArrow.arrowCells, cell)
                  ) ||
                  (
                    state.currentArrow.arrowCells.length === 0 &&
                    expandsArea8(state.currentArrow.circleCells, cell)
                  )
                )
              ) {
                state.currentArrow.arrowCells.push(cell)
              }
            }
            break
          }
          case ConstraintType.Odd: {
            if (!state.constraints?.oddCells?.find(isSelectedCell) &&
                !state.constraints?.evenCells?.find(isSelectedCell)
            ) {
              state.constraints!.oddCells?.push(selectedCell)
            }
            break
          }
          case ConstraintType.Even: {
            if (!state.constraints?.oddCells?.find(isSelectedCell) &&
                !state.constraints?.evenCells?.find(isSelectedCell)
            ) {
              state.constraints!.evenCells?.push(selectedCell)
            }
            break
          }
          case ConstraintType.Renban: {
            if (
              state.currentRenban.length === 0 ||
              !find(state.currentRenban, cell) &&
              expandsArea8(state.currentRenban, cell)
            ) {
              state.currentRenban.push(cell)
            }
            break
          }
          case ConstraintType.Palindrome: {
            if (
              state.currentPalindrome.length === 0 ||
              !find(state.currentPalindrome, cell) &&
              expandsArea8(state.currentPalindrome, cell)
            ) {
              state.currentPalindrome.push(cell)
            }
            break
          }
          default:
            constraintChanged = false
        }

        anyConstraintsChanged ||= constraintChanged
      }

      if (anyConstraintsChanged) {
        handleConstraintChange(state)
      }
    },
    changeConstraintType(state, action) {
      state.constraintType = action.payload
      state.selectedCells = []
      state.currentThermo = []
      state.currentArrow = {
        circleCells: [],
        arrowCells: [],
      }
      state.currentRenban = []
      state.currentPalindrome = []

      const gridSize = state.constraints!.gridSize
      switch (state.constraintType) {
        case ConstraintType.Regions:
          state.constraintGrid = regionsToRegionGrid(gridSize, state.constraints!.regions ?? [])
          break
        case ConstraintType.Arrow:
          state.arrowConstraintType = ArrowConstraintType.Circle
          break
      }

      handleConstraintChange(state)
    },
    changeArrowConstraintType(state, action) {
      state.arrowConstraintType = action.payload
    },
    changeSelectedCellValue(state, action) {
      switch (state.constraintType) {
        case ConstraintType.FixedNumber: {
          const fixedNumbers = state.selectedCells.map((selectedCell: CellPosition) => ({
            position: selectedCell,
            value: action.payload,
          }))
          const areAllExisting = isEmpty(differenceWith(
            fixedNumbers, state.constraints!.fixedNumbers ?? [], isEqual
          ))
          const isEqualPosition = (fn1: FixedNumber, fn2: FixedNumber) => (
            isEqual(fn1.position, fn2.position)
          )
          pullAllWith(state.constraints!.fixedNumbers ?? [], fixedNumbers, isEqualPosition)
          if (!areAllExisting) {
            state.constraints!.fixedNumbers?.push(...fixedNumbers)
          }
          break
        }
      }

      handleConstraintChange(state)
    },
    addConstraint(state) {
      const gridSize = state.constraints!.gridSize

      switch (state.constraintType) {
        case ConstraintType.Thermo: {
          assert(state.currentThermo.length > 0, 'Click on a cell to start a thermo.')
          assert(
            state.currentThermo.length > 1,
            'Thermo is too short. Click on other cells to expand it.'
          )
          assert(
            state.currentThermo.length <= state.constraints!.gridSize,
            'Thermo is too long. Delete it with Backspace.'
          )
          state.constraints!.thermos!.push(state.currentThermo)
          state.currentThermo = []
          break
        }
        case ConstraintType.Arrow: {
          assert(
            state.currentArrow.circleCells.length > 0,
            'Arrow element has no circle part. Click on any cell to create it.'
          )
          assert(
            state.currentArrow.arrowCells.length > 0,
            'Arrow element has no arrow part. Click on any cell next to the circle to start it.'
          )
          state.constraints!.arrows!.push(state.currentArrow)
          state.currentArrow = {
            circleCells: [],
            arrowCells: [],
          }
          break
        }
        case ConstraintType.Renban: {
          assert(state.currentRenban.length > 0, 'Click on a cell to start a renban line.')
          assert(
            state.currentRenban.length > 1,
            'Renban line is too short. Click on other cells to expand it.'
          )
          assert(
            state.currentRenban.length <= state.constraints!.gridSize,
            'Renban line is too long. Delete it with Backspace.'
          )
          state.constraints!.renbans!.push(state.currentRenban)
          state.currentRenban = []
          break
        }
        case ConstraintType.Regions: {
          const regions: Region[] = regionGridToRegions(gridSize, state.constraintGrid!)
          state.constraints!.regions = regions
          break
        }
        case ConstraintType.ExtraRegions: {
          const region: Region = sortBy(state.selectedCells, [ 'row', 'col' ])
          assert(
            region.length === gridSize,
            `Extra region must be of size ${gridSize}. Select multiple cells with Shift + Click.`
          )
          state.constraints!.extraRegions?.push(region)
          break
        }
        case ConstraintType.KillerCage: {
          assert(
            !isEmpty(state.selectedCells),
            'Select at least one cell. You can select multiple cells with Shift + Click.'
          )
          const region: Region = sortBy(state.selectedCells, [ 'row', 'col' ])
          const killerCage: KillerCage = {
            sum: state.killerSum!,
            region,
          }
          state.constraints!.killerCages!.push(killerCage)
          state.killerSum = null
          break
        }
        case ConstraintType.KropkiConsecutive:
        case ConstraintType.KropkiDouble: {
          const cells: CellPosition[] = sortBy(state.selectedCells, [ 'row', 'col' ])
          assert(cells.length === 2, 'Select exactly 2 cells with Shift + Click.')
          assert(
            Math.abs(cells[0].row - cells[1].row) + Math.abs(cells[0].col - cells[1].col) === 1,
            'Cells need to be adjacent'
          )
          const dotType: KropkiDotType =
            state.constraintType === ConstraintType.KropkiConsecutive ? 'Consecutive' : 'Double'
          const kropkiDot: KropkiDot = {
            dotType,
            cell1: cells[0],
            cell2: cells[1],
          }
          const existingDot = state.constraints!.kropkiDots?.find(dot => (
            isEqual(dot.cell1, kropkiDot.cell1) && isEqual(dot.cell2, kropkiDot.cell2)
          ))
          if (!existingDot) {
            state.constraints!.kropkiDots!.push(kropkiDot)
          }
          break
        }
        case ConstraintType.Palindrome: {
          assert(state.currentPalindrome.length > 0, 'Click on a cell to start a palindrome line.')
          assert(
            state.currentPalindrome.length > 1,
            'Palindrome line is too short. Click on other cells to expand it.'
          )
          state.constraints!.palindromes!.push(state.currentPalindrome)
          state.currentPalindrome = []
          break
        }
      }

      handleConstraintChange(state)
    },
    deleteConstraint(state) {
      for (const cell of state.selectedCells) {
        state.cellMarks![cell.row][cell.col] = {}

        const isSelectedCell = (areaCell: CellPosition) => isEqual(areaCell, cell)

        // Fixed numbers
        remove(
          state.constraints!.fixedNumbers ?? [],
          (existingFixedNumber: FixedNumber) => isEqual(existingFixedNumber.position, cell)
        )

        // Thermo
        if (state.currentThermo.find(isSelectedCell)) {
          state.currentThermo = []
        }

        const thermoIndex = findIndex(state.constraints!.thermos, (thermo: Thermo) => thermo.some(isSelectedCell))
        if (thermoIndex !== -1) {
          state.constraints!.thermos?.splice(thermoIndex, 1)
        }

        // Arrow
        if (state.currentArrow.circleCells.find(isSelectedCell) || state.currentArrow.arrowCells.find(isSelectedCell)) {
          state.currentArrow = {
            circleCells: [],
            arrowCells: [],
          }
        }

        const arrowIndex = findIndex(state.constraints!.arrows, (arrow: Arrow) => (
          arrow.circleCells.some(isSelectedCell) || arrow.arrowCells.some(isSelectedCell)
        ))
        if (arrowIndex !== -1) {
          state.constraints!.arrows?.splice(arrowIndex, 1)
        }

        // Renban
        if (state.currentRenban.find(isSelectedCell)) {
          state.currentRenban = []
        }

        const renbanIndex = findIndex(state.constraints!.renbans, (renban: Renban) => renban.some(isSelectedCell))
        if (renbanIndex !== -1) {
          state.constraints!.renbans?.splice(renbanIndex, 1)
        }

        // Palindrome
        if (state.currentPalindrome.find(isSelectedCell)) {
          state.currentPalindrome = []
        }

        const palindromeIndex = findIndex(state.constraints!.palindromes, (palindrome: Palindrome) => palindrome.some(isSelectedCell))
        if (palindromeIndex !== -1) {
          state.constraints!.palindromes?.splice(palindromeIndex, 1)
        }

        // Killer
        const killerIndex = findIndex(state.constraints!.killerCages, (killerCage: KillerCage) => killerCage.region.some(isSelectedCell))
        if (killerIndex !== -1) {
          state.constraints!.killerCages?.splice(killerIndex, 1)
        }

        // Kropki
        remove(state.constraints!.kropkiDots ?? [], kropkiDot => (
          isEqual(kropkiDot.cell1, cell) || isEqual(kropkiDot.cell2, cell)
        ))

        // Extra Regions
        const regionIndex = findIndex(state.constraints!.extraRegions, (extraRegion: Region) => extraRegion.some(isSelectedCell))
        if (regionIndex !== -1) {
          state.constraints!.extraRegions?.splice(regionIndex, 1)
        }

        // Odd Even
        remove(state.constraints!.oddCells ?? [], isSelectedCell)
        remove(state.constraints!.evenCells ?? [], isSelectedCell)
      }

      handleConstraintChange(state)
    },
    requestSolution(state, action) {
      if (action.payload === SolverType.Brute) {
        state.bruteSolverRunning = true
      } else {
        state.logicalSolverRunning = true
      }
      state.puzzlePublicId = null
    },
    responseSolution(state, action) {
      if (action.payload.type === SolverType.Brute) {
        state.bruteSolution = action.payload.solution
        state.bruteSolverRunning = false
      } else {
        state.logicalSolution = action.payload.solution
        state.logicalSolverRunning = false
        // Setting index to the extra step after the last real step
        state.logicalSolutionStepIndex = action.payload.solution.steps.length
      }
    },
    changeLogicalSolutionStepIndex(state, action) {
      state.logicalSolutionStepIndex = action.payload
    },
    errorSolution(state, action) {
      if (action.payload === SolverType.Brute) {
        state.bruteSolverRunning = false
      } else {
        state.logicalSolverRunning = false
      }
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
    toggleCornerMarksActive(state) {
      // Center marks reserved for solutions, so just toggle between numbers and corner marks
      if (state.inputMode === InputMode.Numbers) {
        state.inputMode = InputMode.CornerMarks
      } else {
        state.inputMode = InputMode.Numbers
      }
    },
    changeSelectedCellCornerMarks(state, action) {
      const value = action.payload
      const selectedCells: CellPosition[] = state.selectedCells
      const areAllExisting = selectedCells.every(({ row, col }: CellPosition) => (
        state.cellMarks![row][col]?.cornerMarks?.includes(value)
      ))

      for (const { row, col } of state.selectedCells) {
        if (state.cellMarks![row][col]?.cornerMarks !== undefined) {
          pull(state.cellMarks![row][col]!.cornerMarks!, value)
        }
      }

      if (!areAllExisting) {
        for (const { row, col } of state.selectedCells) {
          if (state.cellMarks![row][col].cornerMarks === undefined) {
            state.cellMarks![row][col].cornerMarks = []
          }
          state.cellMarks![row][col].cornerMarks!.push(value)
        }
      }
    },
    changeSelectedCellConstraint(state, action) {
      if (isEmpty(state.selectedCells)) {
        return
      }
      switch (state.constraintType) {
        case ConstraintType.Regions: {
          for (const { row, col } of state.selectedCells) {
            const value = action.payload
            state.constraintGrid![row][col] = value
          }
        }
      }
    },
    changeConstraintValue(state, { payload: { key, value } }: { payload: { key: ConstraintKeyType, value: boolean } }) {
      state.constraints![key] = value
      handleConstraintChange(state)
    },
    changeKillerSum(state, action) {
      state.killerSum = action.payload
      handleConstraintChange(state)
    },
    changeSourceCollectionId(state, action) {
      state.sourceCollectionId = action.payload
    },
    changeInputActive(state, action) {
      state.inputActive = action.payload
    },
    clearBruteSolution(state) {
      state.bruteSolution = null
    },
    clearLogicalSolution(state) {
      state.logicalSolution = null
    },
    changeAuthor(state, action) {
      state.author = action.payload
    },
  },
})

export const {
  initPuzzle, receivedPuzzle, changeSelectedCell, changeConstraintType, changeSelectedCellValue, changeArrowConstraintType,
  addConstraint, deleteConstraint, requestSolution, responseSolution,
  errorSolution, changeDifficulty,
  requestAddPuzzle, responseAddPuzzle, errorAddPuzzle,
  toggleCornerMarksActive, changeSelectedCellCornerMarks,
  changeConstraintValue, changeKillerSum,
  changeInputActive, changeSourceCollectionId, changeSelectedCellConstraint,
  clearBruteSolution, clearLogicalSolution, changeAuthor, changeLogicalSolutionStepIndex,
} = builderSlice.actions

export default builderSlice.reducer
