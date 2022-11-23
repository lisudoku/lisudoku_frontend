import _ from 'lodash'
import { createSlice } from '@reduxjs/toolkit'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'

type UserDataState = {
  username: string | null,
  token: string | null,
  difficulty: SudokuDifficulty,
}

export const userDataSlice = createSlice({
  name: 'userData',
  initialState: {
    username: null,
    token: null,
    difficulty: SudokuDifficulty.Easy9x9,
  } as UserDataState,
  reducers: {
    updateDifficulty(state, action) {
      state.difficulty = action.payload
    },
  }
})

export const { updateDifficulty } = userDataSlice.actions

export default userDataSlice.reducer
