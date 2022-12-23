import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
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
  selectedCell: CellPosition | null
  solved: boolean
  createdAt: string
  updatedAt: string
}

type TvState = {
  tvPuzzles: TvPuzzle[]
}

export const tvSlice = createSlice({
  name: 'tv',
  initialState: {
    tvPuzzles: [],
  } as TvState,
  reducers: {
    initPuzzles(state, action) {
      const tvPuzzles = action.payload.map((tvPuzzle: any) => ({
        ...jcc.camelCaseKeys(tvPuzzle),
        // grid has to be handled separately because of jcc
        grid: tvPuzzle.grid,
      }))
      state.tvPuzzles = tvPuzzles
    },
    updatePuzzle(state, action) {
      const data = action.payload

      // Grid has to be handled separately
      const grid = data.grid

      const tvPuzzle = jcc.camelCaseKeys(data)
      tvPuzzle.grid = grid
      const { id, notes, selectedCell, solved, updatedAt } = tvPuzzle

      const existingPuzzle = state.tvPuzzles.find((puzzle: TvPuzzle) => puzzle.id === id)

      if (existingPuzzle) {
        state.tvPuzzles = state.tvPuzzles.map(tvPuzzle => {
          if (tvPuzzle.id === id) {
            return {
              ...tvPuzzle,
              grid,
              notes,
              selectedCell,
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
  },
})

export const {
  initPuzzles, updatePuzzle,
} = tvSlice.actions

export default tvSlice.reducer
