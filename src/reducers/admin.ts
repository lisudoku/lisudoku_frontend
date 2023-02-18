import { createSlice } from '@reduxjs/toolkit'
import { Puzzle } from 'src/types/sudoku'
const jcc = require('json-case-convertor')

type AdminState = {
  puzzles: Puzzle[]
}

export const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    puzzles: [],
  } as AdminState,
  reducers: {
    responsePuzzles(state, action) {
      state.puzzles = action.payload.map((puzzle: Puzzle) => jcc.camelCaseKeys(puzzle))
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
