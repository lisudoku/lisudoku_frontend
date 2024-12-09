import { createSlice } from '@reduxjs/toolkit'

type MiscState = {
  isOnline: boolean
  voiceWords: string
  voiceListening: boolean
}

export const miscSlice = createSlice({
  name: 'misc',
  initialState: {
    isOnline: navigator.onLine,
    voiceWords: '',
    voiceListening: false,
  } as MiscState,
  reducers: {
    updateIsOnline(state, action) {
      state.isOnline = action.payload
    },
    updateVoiceWords(state, action) {
      state.voiceWords = action.payload
    },
    updateVoiceListening(state, action) {
      state.voiceListening = action.payload
    },
  },
})

export const {
  updateIsOnline, updateVoiceWords, updateVoiceListening,
} = miscSlice.actions

export default miscSlice.reducer
