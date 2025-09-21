import { ReactElement } from 'react'
import { Honeybadger, HoneybadgerErrorBoundary } from '@honeybadger-io/react'
import { isHeadlessBrowser } from 'src/utils/misc'

export const honeybadger = Honeybadger.configure({
  apiKey: import.meta.env.VITE_HONEYBADGER_API_KEY,
  environment: import.meta.env.PROD ? 'production' : 'development',
  revision: __APP_VERSION__,
})

const IGNORE_HEADLESS_ALERTS = [
  'Puzzle import success',
  'External puzzle import error',
]

honeybadger.beforeNotify((notice) => {
  if (notice !== undefined && IGNORE_HEADLESS_ALERTS.includes(notice.name)) {
    return !isHeadlessBrowser()
  }
  return true
})

const HoneybadgerProvider = ({ children }: { children: ReactElement }) => (
  <HoneybadgerErrorBoundary honeybadger={honeybadger}>
    {children}
  </HoneybadgerErrorBoundary>
)

export default HoneybadgerProvider
