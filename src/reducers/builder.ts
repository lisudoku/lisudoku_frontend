import { createSlice } from '@reduxjs/toolkit'
import {
  cloneDeep,
  compact,
  differenceWith, isEmpty, isEqual,
  pull, pullAllWith, uniqWith, xorWith,
} from 'lodash-es'
import {
  CellMarks, BooleanConstraintDataKey, ConstraintType,
  SudokuDifficulty, SudokuVariant,
} from 'src/types/sudoku'
import { SolverType } from 'src/types/wasm'
import { camelCaseKeys } from 'src/utils/json'
import { assert } from 'src/utils/misc'
import { defaultConstraints, regionsToRegionGrid } from 'src/utils/sudoku'
import { InputMode } from './puzzle'
import type {
  CellPosition, FixedNumber, SudokuBruteSolveResult, SudokuConstraints, SudokuLogicalSolveResult,
} from 'lisudoku-solver'
import { detectConstraints } from 'src/constraints/utils'
import { constraintDefinitions } from 'src/constraints/definitions'
import { ArrowConstraintType, ConstraintEditorState } from 'src/constraints/editorState'
import type { WorkerSolutionResponse } from 'src/workers/types'
import { formatISO } from 'date-fns/esm'

type SolverStatus = 'running' | 'error' | 'ok'

interface BaseSolverState {
  status: SolverStatus
  runStartedAt?: string
  error?: string
}

export interface BruteSolverState extends BaseSolverState {
  solution?: SudokuBruteSolveResult
}

export interface LogicalSolverState extends BaseSolverState {
  solution?: SudokuLogicalSolveResult
  solutionStepIndex?: number
}

// TODO: split into separate reducers
type BuilderState = {
  inputActive: boolean
  sourceCollectionId: string
  author: string
  // Stable and valid puzzle constraints
  committedConstraints: SudokuConstraints | null
  // Draft constraints with added in progress constraint
  constraints: SudokuConstraints | null
  constraintEditorState: ConstraintEditorState
  variant: SudokuVariant
  difficulty: SudokuDifficulty
  inputMode: InputMode
  cellMarks: CellMarks[][] | null
  bruteSolverState: BruteSolverState
  logicalSolverState: LogicalSolverState
  setterMode: boolean
  puzzlePublicId: string | null
  puzzleAdding: boolean
  manualChange: boolean
}

const defaultDifficulty = (gridSize: number) => {
  switch (gridSize) {
    case 4: return SudokuDifficulty.Easy4x4
    case 6: return SudokuDifficulty.Easy6x6
    default: return SudokuDifficulty.Easy9x9
  }
}

const handleConstraintChange = (state: BuilderState) => {
  state.variant = detectConstraints(state.committedConstraints).variant
  state.bruteSolverState = { status: 'ok' }
  state.logicalSolverState = { status: 'ok' }
  state.manualChange = true
}

const clearEditorState = (state: BuilderState) => {
  state.constraintEditorState = {
    type: state.constraintEditorState.type,
    selectedCells: [],
    arrowConstraintType: ArrowConstraintType.Circle,
  }
  if (state.constraintEditorState.type === ConstraintType.Regions && state.constraints !== null) {
    state.constraintEditorState.regionsGrid = regionsToRegionGrid(
      state.constraints.gridSize,
      state.constraints.regions ?? [],
    )
  }
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
    inputMode: InputMode.Numbers,
    cellMarks: null,
    bruteSolverState: { status: 'ok' },
    logicalSolverState: { status: 'ok' },
    setterMode: false,
    sourceName: '',
    sourceUrl: '',
    puzzlePublicId: null,
    puzzleAdding: false,
    committedConstraints: null,
    constraintEditorState: {
      type: ConstraintType.FixedNumber,
      selectedCells: [],
      arrowConstraintType: ArrowConstraintType.Circle,
    },
    constraintGrid: null,
    manualChange: false,
  } as BuilderState,
  reducers: {
    initPuzzle(state, action) {
      if (action.payload.gridSize) {
        const gridSize = Number.parseInt(action.payload.gridSize)
        state.committedConstraints = defaultConstraints(gridSize)
        state.constraints = cloneDeep(state.committedConstraints)
        state.difficulty = defaultDifficulty(gridSize)
        state.cellMarks = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => ({})))
        state.bruteSolverState = { status: 'ok' }
        state.logicalSolverState = { status: 'ok' }
        state.manualChange = false
        clearEditorState(state)
      }
      if (action.payload.setterMode !== undefined) {
        state.setterMode = action.payload.setterMode
      }
    },
    receivedPuzzle(state, action) {
      const constraints: Partial<SudokuConstraints> = camelCaseKeys(action.payload)
      const gridSize = constraints.gridSize!
      state.committedConstraints = {
        ...defaultConstraints(gridSize),
        ...constraints,
      }
      state.constraints = cloneDeep(state.committedConstraints)
      state.difficulty = defaultDifficulty(gridSize)
      state.variant = detectConstraints(state.constraints).variant
      state.cellMarks = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => ({})))
      state.bruteSolverState = { status: 'ok' }
      state.logicalSolverState = { status: 'ok' }
      state.manualChange = false
    },
    changeSelectedCell(state, action) {
      const { cell, ctrl, isClick } = action.payload
      if (ctrl) {
        if (isClick) {
          state.constraintEditorState.selectedCells = xorWith(state.constraintEditorState.selectedCells, [ cell ], isEqual)
        } else {
          state.constraintEditorState.selectedCells = uniqWith([ ...state.constraintEditorState.selectedCells, cell ], isEqual)
        }
      } else {
        // Passing a null cell will clear the selection
        state.constraintEditorState.selectedCells = compact([ cell ])
      }

      if (state.constraints) {
        const { expandCurrentConstraintAtCell } = constraintDefinitions[state.constraintEditorState.type]
        const isSelectedCell = (otherCell: CellPosition) => isEqual(otherCell, cell)
        const constraintChanged = expandCurrentConstraintAtCell({
          constraints: state.constraints,
          cell,
          isSelectedCell,
          editorState: state.constraintEditorState,
        })

        if (constraintChanged) {
          handleConstraintChange(state)
        }
      }
    },
    changeConstraintType(state, action) {
      state.constraintEditorState.type = action.payload
      state.constraints = cloneDeep(state.committedConstraints)
      clearEditorState(state)
      handleConstraintChange(state)
    },
    changeArrowConstraintType(state, action) {
      state.constraintEditorState.arrowConstraintType = action.payload
    },
    changeSelectedCellValue(state, action) {
      switch (state.constraintEditorState.type) {
        case ConstraintType.FixedNumber: {
          if (!state.committedConstraints) {
            break
          }
          const fixedNumbers = state.constraintEditorState.selectedCells.map((selectedCell: CellPosition) => ({
            position: selectedCell,
            value: action.payload,
          }))
          const areAllExisting = isEmpty(differenceWith(
            fixedNumbers, state.committedConstraints.fixedNumbers ?? [], isEqual
          ))
          const isEqualPosition = (fn1: FixedNumber, fn2: FixedNumber) => (
            isEqual(fn1.position, fn2.position)
          )
          pullAllWith(state.committedConstraints.fixedNumbers ?? [], fixedNumbers, isEqualPosition)
          if (!areAllExisting) {
            state.committedConstraints.fixedNumbers?.push(...fixedNumbers)
          }
          state.constraints = cloneDeep(state.committedConstraints)
          break
        }
      }

      handleConstraintChange(state)
    },
    addConstraint(state) {
      if (state.constraints) {
        const {
          validateCurrentConstraint, prepareCurrentConstraint,
        } = constraintDefinitions[state.constraintEditorState.type]

        const constraintCtx = {
          editorState: state.constraintEditorState,
          constraints: state.constraints,
        }
        const validationResult = validateCurrentConstraint(constraintCtx)

        assert(validationResult.type !== 'error' && validationResult.type !== 'info', validationResult.message)

        const changes = prepareCurrentConstraint(constraintCtx)
        if (changes !== null) {
          if (changes.newConstraints !== undefined) {
            state.constraints = changes.newConstraints
          }
          if (changes.newEditorState !== undefined) {
            state.constraintEditorState = changes.newEditorState
          }
        }
      }

      state.committedConstraints = cloneDeep(state.constraints)

      clearEditorState(state)
      handleConstraintChange(state)
    },
    deleteConstraint(state) {
      const selectedCells = state.constraintEditorState.selectedCells
      for (const cell of selectedCells) {
        if (state.cellMarks) {
          state.cellMarks[cell.row][cell.col] = {}
        }
        if (state.committedConstraints) {
          for (const { removeConstraintsAtCell } of Object.values(constraintDefinitions)) {
            const isSelectedCell = (otherCell: CellPosition) => isEqual(otherCell, cell)
            removeConstraintsAtCell({
              constraints: state.committedConstraints,
              cell,
              isSelectedCell,
            })
          }
        }
        state.constraints = cloneDeep(state.committedConstraints)
      }

      // Note: we always delete existing (non-targetted) draft constraints
      clearEditorState(state)
      // Keep existing selected cells
      state.constraintEditorState.selectedCells = selectedCells

      handleConstraintChange(state)
    },
    requestSolution(state, action) {
      const newSolverState = {
        status: 'running' as const,
        runStartedAt: formatISO(new Date()),
      }
      if (action.payload === SolverType.Brute) {
        state.bruteSolverState = newSolverState
      } else {
        state.logicalSolverState = newSolverState
      }
      state.puzzlePublicId = null
    },
    responseSolution(state, { payload }: { payload: WorkerSolutionResponse }) {
      // Note: runStartedAt is cleared
      if (payload.solverType === SolverType.Brute) {
        state.bruteSolverState = {
          status: payload.error ? 'error' : 'ok',
          error: payload.error,
          solution: payload.solution,
        }
      } else {
        state.logicalSolverState = {
          status: payload.error ? 'error' : 'ok',
          error: payload.error,
          solution: payload.solution,
          // Setting index to the extra step after the last real step
          solutionStepIndex: payload.solution?.steps.length,
        }
      }
    },
    changeLogicalSolutionStepIndex(state, action) {
      state.logicalSolverState.solutionStepIndex = action.payload
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
      const selectedCells = state.constraintEditorState.selectedCells
      const areAllExisting = selectedCells.every(({ row, col }: CellPosition) => (
        state.cellMarks![row][col]?.cornerMarks?.includes(value)
      ))

      for (const { row, col } of selectedCells) {
        if (state.cellMarks![row][col]?.cornerMarks !== undefined) {
          pull(state.cellMarks![row][col]!.cornerMarks!, value)
        }
      }

      if (!areAllExisting) {
        for (const { row, col } of selectedCells) {
          if (state.cellMarks![row][col].cornerMarks === undefined) {
            state.cellMarks![row][col].cornerMarks = []
          }
          state.cellMarks![row][col].cornerMarks!.push(value)
        }
      }
    },
    changeSelectedCellConstraint(state, action) {
      if (isEmpty(state.constraintEditorState.selectedCells)) {
        return
      }
      if (state.constraintEditorState.type === ConstraintType.Regions) {
        for (const { row, col } of state.constraintEditorState.selectedCells) {
          const value = action.payload
          state.constraintEditorState.regionsGrid![row][col] = value
        }
      }
    },
    changeConstraintValue(state, { payload: { key, value } }: { payload: { key: BooleanConstraintDataKey, value: boolean } }) {
      if (state.constraints && state.committedConstraints) {
        // Note: we are making the change in both draft and committed constraints
        // because we want to commit the boolean change, but not the other
        // possibly in progress draft constraint
        state.constraints[key] = value
        state.committedConstraints[key] = value
        handleConstraintChange(state)
      }
    },
    changeKillerSum(state, action) {
      state.constraintEditorState.killerSum = action.payload
      handleConstraintChange(state)
    },
    changeSourceCollectionId(state, action) {
      state.sourceCollectionId = action.payload
    },
    changeInputActive(state, action) {
      state.inputActive = action.payload
    },
    clearBruteSolution(state) {
      state.bruteSolverState = { status: 'ok' }
    },
    clearLogicalSolution(state) {
      state.logicalSolverState = { status: 'ok' }
    },
    changeAuthor(state, action) {
      state.author = action.payload
    },
  },
})

export const {
  initPuzzle, receivedPuzzle, changeSelectedCell, changeConstraintType, changeSelectedCellValue, changeArrowConstraintType,
  addConstraint, deleteConstraint, requestSolution, responseSolution, changeDifficulty,
  requestAddPuzzle, responseAddPuzzle, errorAddPuzzle,
  toggleCornerMarksActive, changeSelectedCellCornerMarks,
  changeConstraintValue, changeKillerSum,
  changeInputActive, changeSourceCollectionId, changeSelectedCellConstraint,
  clearBruteSolution, clearLogicalSolution, changeAuthor, changeLogicalSolutionStepIndex,
} = builderSlice.actions

export default builderSlice.reducer
