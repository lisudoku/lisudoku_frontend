import { configureStore } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'
import {
  persistStore, persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import puzzleReducer from './reducers/puzzle'
import trainer from './reducers/trainer'
import userData from './reducers/userData'
import admin from './reducers/admin'
import builder from './reducers/builder'
import tv from './reducers/tv'
import collections from './reducers/collections'
import competitions from './reducers/competitions'
import misc from './reducers/misc'
import { combineReducers } from 'redux'

const reducers = combineReducers({
  puzzle: puzzleReducer,
  trainer,
  userData,
  admin,
  builder,
  tv,
  collections,
  competitions,
  misc,
})

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: [ 'userData', 'puzzle' ],
}

const persistedReducer = persistReducer(persistConfig, reducers)

const logger = createLogger({
  predicate: (_getState, action) => (
    !action.type.includes('puzzle/updateTimer') &&
    !action.type.includes('misc/updateVoiceWordsPreview')
  ),
})

export const store = configureStore({
  reducer: persistedReducer,
  devTools: import.meta.env.DEV,
  middleware: getDefaultMiddleware => {
    let middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    if (import.meta.env.DEV) {
      (middlewares as any) = middlewares.concat(logger)
    }
    return middlewares
  },
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
