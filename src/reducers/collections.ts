import { createSlice } from '@reduxjs/toolkit'
import { PuzzleCollection } from 'src/types'

type CollectionsState = {
  collections?: PuzzleCollection[]
}

export const collectionsSlice = createSlice({
  name: 'collections',
  initialState: {
    collections: undefined,
  } as CollectionsState,
  reducers: {
    responsePuzzleCollections(state, action) {
      state.collections = action.payload
    },
    createdPuzzleCollection(state, action) {
      state.collections!.push(action.payload)
    },
    deletedPuzzleCollection(state, action) {
      state.collections = state.collections!.filter(({ id }) => id !== action.payload)
    },
  },
})

export const {
  responsePuzzleCollections, createdPuzzleCollection, deletedPuzzleCollection,
} = collectionsSlice.actions

export default collectionsSlice.reducer
