import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
import { TrainerPuzzle, TrainerTechnique } from 'src/types';
import { CellPosition, Grid, SudokuConstraints } from 'src/types/sudoku';
import { ensureDefaultRegions, gridSizeFromString, gridStringToFixedNumbers, gridStringToGrid } from 'src/utils/sudoku';

interface ExtendedTrainerPuzzle extends TrainerPuzzle {
  constraints: SudokuConstraints
}

const parseTranerPuzzleData: (data: any) => ExtendedTrainerPuzzle = (data: any) => {
  const gridString = data.grid
  const gridSize = gridSizeFromString(gridString)

  const constraints: SudokuConstraints = {
    gridSize,
    regions: ensureDefaultRegions(gridSize),
    fixedNumbers: gridStringToFixedNumbers(gridString),
  }

  return {
    id: data.id,
    variant: data.variant,
    technique: data.technique,
    solutions: data.solutions,
    grid: data.grid,
    puzzlePublicId: data.puzzle_id,
    constraints,
  }
}

type TrainerState = {
  technique: TrainerTechnique
  refreshKey: number

  data?: ExtendedTrainerPuzzle
  grid?: Grid
  selectedCell?: CellPosition

  solveTimer: number
  finished: boolean
  success: boolean
  abandoned: boolean
}

export const trainerSlice = createSlice({
  name: 'trainer',
  initialState: {
    refreshKey: 0,
    technique: TrainerTechnique.Singles,
    data: undefined,
    grid: undefined,
    selectedCell: undefined,
    solveTimer: 0,
    finished: false,
    success: false,
    abandoned: false,
  } as TrainerState,
  reducers: {
    requestedTrainerPuzzle(_state) {},
    receivedTrainerPuzzle(state, action) {
      state.data = parseTranerPuzzleData(action.payload)
      state.grid = gridStringToGrid(state.data.grid)
      state.solveTimer = 0
      state.finished = false
      state.success = false
      state.abandoned = false
    },
    updateTechnique(state, action) {
      state.technique = action.payload
      state.refreshKey += 1
    },
    updateTimer(state) {
      state.solveTimer += 1
    },
    showSolutions(state) {
      state.finished = true
      state.success = false
      state.abandoned = true
    },
    fetchNewPuzzle(state) {
      // This will trigger refetching the puzzle
      state.refreshKey += 1
    },
    changeSelectedCell(state, action) {
      if (state.finished) {
        return
      }
      state.selectedCell = action.payload
    },
    changeSelectedCellValue(state, action) {
      if (state.finished) {
        return
      }
      if (state.selectedCell === undefined) {
        return
      }

      const value = action.payload
      if (!value) {
        return
      }

      const { row, col } = state.selectedCell

      if (state.grid![row][col] !== null) {
        return
      }

      state.grid![row][col] = value

      // Result
      state.finished = true
      state.success = !!state.data?.solutions.find(s => s.value === value && _.isEqual(s.position, state.selectedCell))
    },
  },
})

export const {
  requestedTrainerPuzzle, receivedTrainerPuzzle, updateTechnique, updateTimer,
  showSolutions, fetchNewPuzzle, changeSelectedCell, changeSelectedCellValue,
} = trainerSlice.actions

export default trainerSlice.reducer
