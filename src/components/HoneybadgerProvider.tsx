import { ReactElement } from 'react'
import { Honeybadger, HoneybadgerErrorBoundary } from '@honeybadger-io/react'

const config = {
  apiKey: import.meta.env.VITE_HONEYBADGER_API_KEY,
  environment: import.meta.env.PROD ? 'production' : 'development',
  revision: 'main',
}

export const honeybadger = Honeybadger.configure(config)

const HoneybadgerProvider = ({ children }: { children: ReactElement }) => (
  <HoneybadgerErrorBoundary honeybadger={honeybadger}>
    {children}
  </HoneybadgerErrorBoundary>
)

export default HoneybadgerProvider
