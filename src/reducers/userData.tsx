import { createSlice } from '@reduxjs/toolkit'
import { SudokuDifficulty } from 'src/types/sudoku'
import { responseSolved } from './puzzle'

type UserDataState = {
  username: string | null
  email: string | null
  token: string | null
  admin: boolean
  difficulty: SudokuDifficulty
  solvedPuzzleIds: string[]
}

export const userDataSlice = createSlice({
  name: 'userData',
  initialState: {
    username: null,
    email: null,
    token: null,
    admin: false,
    difficulty: SudokuDifficulty.Easy9x9,
    solvedPuzzleIds: [],
  } as UserDataState,
  reducers: {
    loginSuccess(state, action) {
      state.username = action.payload.username
      state.email = action.payload.email
      state.token = action.payload.token
      state.admin = action.payload.admin
    },
    clearLoginData(state) {
      state.username = null
      state.email = null
      state.token = null
      state.admin = false
    },
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

export const {
  loginSuccess, clearLoginData, updateDifficulty,
} = userDataSlice.actions

export default userDataSlice.reducer
