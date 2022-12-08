import { createSlice } from '@reduxjs/toolkit'
import { SudokuDifficulty } from 'src/types/sudoku'
import { responseSolved } from './puzzle'

type UserDataState = {
  username: string | null
  token: string | null
  difficulty: SudokuDifficulty
  solvedPuzzleIds: string[]
}

export const userDataSlice = createSlice({
  name: 'userData',
  initialState: {
    username: null,
    token: null,
    difficulty: SudokuDifficulty.Easy9x9,
    solvedPuzzleIds: [],
  } as UserDataState,
  reducers: {
    updateDifficulty(state, action) {
      state.difficulty = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(responseSolved, (state, action) => {
      const id = action.payload.id
      if (action.payload.solved && !state.solvedPuzzleIds.includes(id)) {
        state.solvedPuzzleIds.push(id)
      }
    })
  }
})

export const { updateDifficulty } = userDataSlice.actions

export default userDataSlice.reducer
