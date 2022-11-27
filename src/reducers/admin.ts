import { createSlice } from '@reduxjs/toolkit'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

type GroupCount = {
  variant: SudokuVariant,
  difficulty: SudokuDifficulty,
  count: number,
}

type AdminState = {
  groupCounts: GroupCount[],
}

export const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    groupCounts: [],
  } as AdminState,
  reducers: {
    requestGroupCounts(state) {
      state.groupCounts = []
    },
    responseGroupCounts(state, action) {
      state.groupCounts = action.payload
    }
  },
})

export const {
  requestGroupCounts, responseGroupCounts,
} = adminSlice.actions

export default adminSlice.reducer
