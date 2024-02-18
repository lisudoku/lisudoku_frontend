import { createSlice } from '@reduxjs/toolkit'
import { ExtendedPuzzle } from 'src/types'
import { camelCaseKeys } from 'src/utils/json'

type AdminState = {
  puzzles: ExtendedPuzzle[]
}

export const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    puzzles: [],
  } as AdminState,
  reducers: {
    responsePuzzles(state, action) {
      state.puzzles = action.payload.map((puzzle: ExtendedPuzzle) => camelCaseKeys(puzzle))
    },
    deletePuzzle(state, action) {
      state.puzzles = state.puzzles.filter(puzzle => puzzle.id !== action.payload)
    },
  },
})

export const {
  responsePuzzles, deletePuzzle,
} = adminSlice.actions

export default adminSlice.reducer
