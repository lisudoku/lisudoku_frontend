import { createSlice } from '@reduxjs/toolkit'

type MiscState = {
  isOnline: boolean
  voiceWords: string
  voiceWordsPreview: string
  voiceListening: boolean
}

export const miscSlice = createSlice({
  name: 'misc',
  initialState: {
    isOnline: navigator.onLine,
    voiceWords: '',
    voiceWordsPreview: '',
    voiceListening: false,
  } as MiscState,
  reducers: {
    updateIsOnline(state, action) {
      state.isOnline = action.payload
    },
    updateVoiceWords(state, action) {
      state.voiceWords = action.payload
      state.voiceWordsPreview = ''
    },
    updateVoiceWordsPreview(state, action) {
      state.voiceWordsPreview = action.payload
    },
    updateVoiceListening(state, action) {
      state.voiceListening = action.payload
      if (!state.voiceListening) {
        state.voiceWords = 'Paused'
      }
    },
  },
})

export const {
  updateIsOnline, updateVoiceWords, updateVoiceWordsPreview, updateVoiceListening,
} = miscSlice.actions

export default miscSlice.reducer
