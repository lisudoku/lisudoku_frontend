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
import TvPage from './screens/TvPage'
import AboutPage from './screens/AboutPage'
import { ThemeProvider } from '@material-tailwind/react'
import { store, persistor } from './store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { HelmetProvider } from 'react-helmet-async'
import HoneybadgerProvider from './components/HoneybadgerProvider'
import CollectionPage from './screens/CollectionPage'
import LearnPage from './screens/LearnPage'
import SolverPage from './screens/SolverPage'

const AdminPage = lazy(() => import('./screens/AdminPage'))

const theme = {}

if (process.env.NODE_ENV === 'production') {
  console.debug = () => {}
  console.log = () => {}
  console.info = () => {}
}

const App = () => {
  return (
    <HoneybadgerProvider>
      <HelmetProvider>
        <ThemeProvider value={theme}>
          <div className="min-h-screen md:min-w-fit flex flex-col text-white bg-black">
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <BrowserRouter>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                      <Route path="/" element={<Layout padding={false} />}>
                        <Route path="/" element={<HomePage />} />
                      </Route>
                      <Route path="/" element={<Layout />}>
                        <Route path="/play/:variant/:difficulty" element={<PlayPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="logout" element={<LogoutPage />} />
                        <Route path="register" element={<RegisterPage />} />
                        <Route path="p/:id" element={<PuzzlePage />} />
                        <Route path="tv" element={<TvPage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="collections/:id" element={<CollectionPage />} />
                        <Route path="learn" element={<LearnPage />} />
                        <Route path="solver" element={<SolverPage />} />
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
      </HelmetProvider>
    </HoneybadgerProvider>
  )
}

export default App
