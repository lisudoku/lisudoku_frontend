import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import { Competition } from 'src/types'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { responseSolved } from './puzzle'
const jcc = require('json-case-convertor')

type SolvedPuzzle = {
  id: string
  variant: SudokuVariant
  difficulty: SudokuDifficulty
}

type UserSettings = {
  showTimer: boolean
  checkErrors: boolean
}

const DEFAULT_USER_SETTINGS = {
  showTimer: true,
  checkErrors: true,
}

type UserDataState = {
  username: string | null
  email: string | null
  token: string | null
  admin: boolean
  difficulty: SudokuDifficulty
  solvedPuzzles: SolvedPuzzle[]
  activeCompetitions: Competition[]
  settings?: UserSettings
}

export const userDataSlice = createSlice({
  name: 'userData',
  initialState: {
    username: null,
    email: null,
    token: null,
    admin: false,
    difficulty: SudokuDifficulty.Easy9x9,
    solvedPuzzles: [],
    activeCompetitions: [],
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
    receiveActiveCompetitions(state, action) {
      state.activeCompetitions = jcc.camelCaseKeys(action.payload)
    },
    updateShowTimer(state, action) {
      if (state.settings === undefined) {
        state.settings = DEFAULT_USER_SETTINGS
      }
      state.settings.showTimer = action.payload
    },
    updateCheckErrors(state, action) {
      if (state.settings === undefined) {
        state.settings = DEFAULT_USER_SETTINGS
      }
      state.settings.checkErrors = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(responseSolved, (state, action) => {
      const { id, variant, difficulty } = action.payload
      if (!id) {
        // External puzzle
        return
      }

      if (!action.payload.solved || _.some(state.solvedPuzzles, [ 'id', id ])) {
        return
      }

      const solvedPuzzle: SolvedPuzzle = {
        id,
        variant,
        difficulty,
      }
      state.solvedPuzzles.push(solvedPuzzle)
    })
  }
})

export const {
  loginSuccess, clearLoginData, updateDifficulty, receiveActiveCompetitions,
  updateShowTimer, updateCheckErrors,
} = userDataSlice.actions

export default userDataSlice.reducer
