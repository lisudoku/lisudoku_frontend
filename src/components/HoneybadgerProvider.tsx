import { ReactElement } from 'react'
import { Honeybadger, HoneybadgerErrorBoundary } from '@honeybadger-io/react'

export const honeybadger = Honeybadger.configure({
  apiKey: import.meta.env.VITE_HONEYBADGER_API_KEY,
  environment: import.meta.env.PROD ? 'production' : 'development',
  revision: 'main',
})

honeybadger.beforeNotify((notice) => {
  if (notice?.name === 'Puzzle import success') {
    return (
      !/HeadlessChrome|PhantomJS|Playwright|Puppeteer/.test(navigator.userAgent)
    )
  }
  return true
})

const HoneybadgerProvider = ({ children }: { children: ReactElement }) => (
  <HoneybadgerErrorBoundary honeybadger={honeybadger}>
    {children}
  </HoneybadgerErrorBoundary>
)

export default HoneybadgerProvider
