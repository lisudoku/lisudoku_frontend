import { configureStore } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'
import {
  persistStore, persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import puzzleReducer from './reducers/puzzle'
import userData from './reducers/userData'
import admin from './reducers/admin'
import tv from './reducers/tv'
import { combineReducers } from 'redux'

const reducers = combineReducers({
  puzzle: puzzleReducer,
  userData,
  admin,
  tv,
})

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: [ 'userData', 'puzzle' ],
}

const persistedReducer = persistReducer(persistConfig, reducers)

const logger = createLogger({
  predicate: (_getState, action) => !action.type.includes('puzzle/updateTimer'),
})

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: getDefaultMiddleware => {
    let middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    if (process.env.NODE_ENV !== 'production') {
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
