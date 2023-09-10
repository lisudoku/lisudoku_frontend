import { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@material-tailwind/react'
import { store, persistor } from './store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { HelmetProvider } from 'react-helmet-async'
import HoneybadgerProvider from './components/HoneybadgerProvider'
import AppRoutes from './AppRoutes'

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
                    <AppRoutes />
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
