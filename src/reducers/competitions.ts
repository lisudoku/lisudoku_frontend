import { createSlice } from '@reduxjs/toolkit'
import { Competition } from 'src/types'
import { camelCaseKeys } from 'src/utils/json'

type CompetitionsState = {
  competitions?: Competition[]
}

export const competitionsSlice = createSlice({
  name: 'competitions',
  initialState: {
    competitions: [],
  } as CompetitionsState,
  reducers: {
    receiveCompetitions(state, action) {
      state.competitions = camelCaseKeys(action.payload)
    },
    createdCompetition(state, action) {
      const competition = camelCaseKeys(action.payload)
      state.competitions!.push(competition)
    },
    deletedCompetition(state, action) {
      state.competitions = state.competitions!.filter(({ id }) => id !== action.payload)
    },
  },
})

export const {
  receiveCompetitions, createdCompetition, deletedCompetition,
} = competitionsSlice.actions

export default competitionsSlice.reducer
