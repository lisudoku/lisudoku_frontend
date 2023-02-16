import { ReactElement } from 'react'
import { Honeybadger, HoneybadgerErrorBoundary } from '@honeybadger-io/react'

const config = {
  apiKey: process.env.REACT_APP_HONEYBADGER_API_KEY,
  environment: process.env.NODE_ENV,
  revision: 'main',
}

export const honeybadger = Honeybadger.configure(config)

const HoneybadgerProvider = ({ children }: { children: ReactElement }) => (
  <HoneybadgerErrorBoundary honeybadger={honeybadger}>
    {children}
  </HoneybadgerErrorBoundary>
)

export default HoneybadgerProvider
