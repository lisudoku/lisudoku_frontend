import { Suspense, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { store, persistor } from './store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { HelmetProvider } from 'react-helmet-async'
import HoneybadgerProvider from './components/HoneybadgerProvider'
import OnlineStatusMonitor from './components/OnlineStatusMonitor'
import AppRoutes from './AppRoutes'

const App = () => {
  useEffect(() => {
    document.body.classList.add('dark-theme')
    return () => document.body.classList.remove('dark-theme')
  }, [])

  return (
    <HoneybadgerProvider>
      <HelmetProvider>
        <div className="min-h-screen md:min-w-fit flex flex-col text-primary bg-primary">
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <OnlineStatusMonitor>
                <BrowserRouter>
                  <Suspense fallback={<div>Loading...</div>}>
                    <AppRoutes />
                  </Suspense>
                </BrowserRouter>
              </OnlineStatusMonitor>
            </PersistGate>
          </Provider>
        </div>
      </HelmetProvider>
    </HoneybadgerProvider>
  )
}

export default App
