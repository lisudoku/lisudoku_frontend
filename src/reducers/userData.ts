import { createSlice } from '@reduxjs/toolkit'
import { some } from 'lodash-es'
import { Competition } from 'src/types'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { responseSolved } from './puzzle'
import { ThemeOption } from 'src/components/ThemeProvider'
import { camelCaseKeys } from 'src/utils/json'

type SolvedPuzzle = {
  id: string
  variant: SudokuVariant
  difficulty: SudokuDifficulty
  solveTime: number
}

export type UserSettings = {
  showTimer: boolean
  checkErrors: boolean
  theme: ThemeOption
  showPeers: boolean
  voiceEnabled: boolean
}

const DEFAULT_USER_SETTINGS: UserSettings = {
  showTimer: true,
  checkErrors: true,
  theme: ThemeOption.System,
  showPeers: false,
  voiceEnabled: false,
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

const handleSettingUpdate = (state: UserDataState, key: keyof UserSettings, value: boolean) => {
  if (state.settings === undefined) {
    state.settings = DEFAULT_USER_SETTINGS
  }
  (state.settings[key] as any) = value
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
      state.activeCompetitions = camelCaseKeys(action.payload)
    },
    updateShowTimer(state, action) {
      handleSettingUpdate(state, 'showTimer', action.payload)
    },
    updateCheckErrors(state, action) {
      handleSettingUpdate(state, 'checkErrors', action.payload)
    },
    updateTheme(state, action) {
      handleSettingUpdate(state, 'theme', action.payload)
    },
    updateShowPeers(state, action) {
      handleSettingUpdate(state, 'showPeers', action.payload)
    },
    updateVoiceEnabled(state, action) {
      handleSettingUpdate(state, 'voiceEnabled', action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(responseSolved, (state, action) => {
      const { id, variant, difficulty, solveTime } = action.payload
      if (!id) {
        // External puzzle
        return
      }

      if (!action.payload.solved || some(state.solvedPuzzles, [ 'id', id ])) {
        return
      }

      const solvedPuzzle: SolvedPuzzle = {
        id,
        variant,
        difficulty,
        solveTime,
      }
      state.solvedPuzzles.push(solvedPuzzle)
    })
  }
})

export const {
  loginSuccess, clearLoginData, updateDifficulty, receiveActiveCompetitions,
  updateShowTimer, updateCheckErrors, updateTheme, updateShowPeers, updateVoiceEnabled,
} = userDataSlice.actions

export default userDataSlice.reducer
