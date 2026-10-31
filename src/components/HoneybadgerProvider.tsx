import { ReactElement } from 'react'
import axios from 'axios'
import { Honeybadger, HoneybadgerErrorBoundary } from '@honeybadger-io/react'
import { isHeadlessBrowser } from 'src/utils/misc'

const getRequestContext = ({ originalError: error }: { originalError?: Error }) => {
  if (!axios.isAxiosError(error)) {
    return undefined
  }

  return {
    endpoint: error.config?.url,
    status: error.response?.status ?? 'no response',
  }
}

const honeybadger = Honeybadger.configure({
  apiKey: import.meta.env.VITE_HONEYBADGER_API_KEY,
  environment: import.meta.env.PROD ? 'production' : 'development',
  revision: __APP_VERSION__,
  ignoreBrowserExtensionErrors: true,
  breadcrumbsSelectorAttributes: [ 'data-hb-name', 'id', 'aria-label' ],
})

const IGNORE_HEADLESS_ALERTS = [
  'Puzzle import success',
  'External puzzle import error',
]

honeybadger.beforeNotify((notice) => {
  if (notice?.message?.includes('ResizeObserver loop') || notice?.message?.includes('ethereum')) {
    return false
  }
  if (notice !== undefined && IGNORE_HEADLESS_ALERTS.includes(notice.name)) {
    return !isHeadlessBrowser()
  }

  const request = notice ? getRequestContext(notice) : undefined
  if (notice && request) {
    notice.context = { ...(notice.context ?? {}), request }
  }

  return true
})

export const sendHbAlert = honeybadger.notify.bind(honeybadger)

export const sendHbAlertAsync = honeybadger.notifyAsync.bind(honeybadger)

const HoneybadgerProvider = ({ children }: { children: ReactElement }) => (
  <HoneybadgerErrorBoundary honeybadger={honeybadger}>
    {children}
  </HoneybadgerErrorBoundary>
)

export default HoneybadgerProvider
