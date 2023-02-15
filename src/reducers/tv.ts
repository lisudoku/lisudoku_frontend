import { createSlice } from '@reduxjs/toolkit'
import { CellPosition, Grid, SudokuConstraints, SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
const jcc = require('json-case-convertor')

export type TvPuzzle = {
  id: string
  puzzleId: string
  userId: string
  constraints: SudokuConstraints
  variant: SudokuVariant
  difficulty: SudokuDifficulty
  grid: Grid
  notes: number[][][]
  selectedCells: CellPosition[]
  solved: boolean
  createdAt: string
  updatedAt: string
}

type TvState = {
  tvPuzzles: TvPuzzle[]
  viewerCount: number,
}

export const tvSlice = createSlice({
  name: 'tv',
  initialState: {
    tvPuzzles: [],
    viewerCount: 0,
  } as TvState,
  reducers: {
    initPuzzles(state, action) {
      const tvPuzzles = action.payload.tv_puzzles.map((tvPuzzle: any) => ({
        ...jcc.camelCaseKeys(tvPuzzle),
        // grid has to be handled separately because of jcc
        grid: tvPuzzle.grid,
        selectedCells: tvPuzzle.selected_cells ?? [], // smooth transition from previous data
      }))
      state.tvPuzzles = tvPuzzles
      state.viewerCount = action.payload.viewer_count
    },
    updatePuzzle(state, action) {
      const data = action.payload

      // Grid has to be handled separately
      const grid = data.grid

      const tvPuzzle = jcc.camelCaseKeys(data)
      tvPuzzle.grid = grid
      const { id, notes, selectedCells, solved, updatedAt } = tvPuzzle

      const existingPuzzle = state.tvPuzzles.find((puzzle: TvPuzzle) => puzzle.id === id)

      if (existingPuzzle) {
        state.tvPuzzles = state.tvPuzzles.map(tvPuzzle => {
          if (tvPuzzle.id === id) {
            return {
              ...tvPuzzle,
              grid,
              notes,
              selectedCells,
              solved,
              updatedAt,
            }
          } else {
            return tvPuzzle
          }
        })
        return
      }

      const { createdAt, constraints, variant, difficulty } = tvPuzzle
      console.assert(createdAt && constraints && variant && difficulty)

      state.tvPuzzles.unshift(tvPuzzle)
    },
    removePuzzles(state, action) {
      const ids = action.payload
      state.tvPuzzles = state.tvPuzzles.filter(tvPuzzle => {
        return !ids.includes(tvPuzzle.id)
      })
    },
    updateViewerCount(state, action) {
      state.viewerCount = action.payload
    },
  },
})

export const {
  initPuzzles, updatePuzzle, removePuzzles, updateViewerCount,
} = tvSlice.actions

export default tvSlice.reducer
