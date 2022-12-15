import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import EnsureAdmin from './components/EnsureAdmin'
import HomePage from './screens/HomePage'
import LoginPage from './screens/LoginPage'
import LogoutPage from './screens/LogoutPage'
import RegisterPage from './screens/RegisterPage'
import PageNotFound from './screens/PageNotFound'
import PuzzlePage from './screens/PuzzlePage'
import PlayPage from './screens/PlayPage'
import { ThemeProvider } from '@material-tailwind/react'
import { store, persistor } from './store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

const AdminPage = lazy(() => import('./screens/AdminPage'))

const theme = {}

const App = () => {
  return (
    <ThemeProvider value={theme}>
      <div className="min-h-screen md:min-w-fit flex flex-col text-white bg-black">
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/play/:variant/:difficulty" element={<PlayPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="logout" element={<LogoutPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="p/:id" element={<PuzzlePage />} />
                    <Route path="*" element={<PageNotFound />} />
                  </Route>
                  <Route path="/" element={<Layout admin />}>
                    <Route path="/" element={<EnsureAdmin />}>
                      <Route path="admin/*" element={<AdminPage />} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </div>
    </ThemeProvider>
  )
}

export default App
