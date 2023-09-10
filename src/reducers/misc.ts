import { createSlice } from '@reduxjs/toolkit'

type MiscState = {
  isOnline: boolean
}

export const miscSlice = createSlice({
  name: 'misc',
  initialState: {
    isOnline: navigator.onLine,
  } as MiscState,
  reducers: {
    updateIsOnline(state, action) {
      state.isOnline = action.payload
    },
  },
})

export const {
  updateIsOnline,
} = miscSlice.actions

export default miscSlice.reducer
