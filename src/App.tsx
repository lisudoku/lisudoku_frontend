import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './screens/HomePage'
import EnsureLogin from './components/EnsureLogin'
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

const theme = {}

const App = () => {
  return (
    <ThemeProvider value={theme}>
      <div className="min-h-screen flex flex-col text-white bg-black">
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route path="/" element={<EnsureLogin />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/play/:variant" element={<PlayPage />} />
                  </Route>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="logout" element={<LogoutPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="*" element={<PageNotFound />} />
                  <Route path="p/:id" element={<PuzzlePage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </div>
    </ThemeProvider>
  )
}

export default App
