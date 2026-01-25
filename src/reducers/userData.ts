import { createSlice } from '@reduxjs/toolkit'
import { Competition, UserSolution } from 'src/types'
import { SudokuDifficulty } from 'src/types/sudoku'
import { responseSolved } from './puzzle'
import { ThemeOption } from 'src/components/ThemeProvider'
import { camelCaseKeys } from 'src/utils/json'

export type UserSettings = {
  showTimer: boolean
  checkErrors: boolean
  theme: ThemeOption
  showPeers: boolean
  voiceEnabled: boolean
  solutionDifficultyHeatmap: boolean
  showSplitInputModes: boolean
}

const DEFAULT_USER_SETTINGS: UserSettings = {
  showTimer: true,
  checkErrors: true,
  theme: ThemeOption.System,
  showPeers: false,
  voiceEnabled: false,
  solutionDifficultyHeatmap: false,
  showSplitInputModes: false,
}

type UserDataState = {
  username: string | null
  email: string | null
  token: string | null
  admin: boolean
  difficulty: SudokuDifficulty
  solvedPuzzles: UserSolution[]
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
    updateSolutionDifficultyHeatmap(state, action) {
      handleSettingUpdate(state, 'solutionDifficultyHeatmap', action.payload)
    },
    updateShowSplitInputModes(state, action) {
      handleSettingUpdate(state, 'showSplitInputModes', action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(responseSolved, (state, action) => {
      const { userSolution, solved } = action.payload
      if (userSolution === undefined) {
        // External puzzle
        return
      }

      if (!solved) {
        return
      }

      // Note: allow multiple solves for same puzzle
      state.solvedPuzzles.push(userSolution)
    })
  }
})

export const {
  loginSuccess, clearLoginData, updateDifficulty, receiveActiveCompetitions,
  updateShowTimer, updateCheckErrors, updateTheme, updateShowPeers, updateVoiceEnabled,
  updateSolutionDifficultyHeatmap, updateShowSplitInputModes,
} = userDataSlice.actions

export default userDataSlice.reducer
