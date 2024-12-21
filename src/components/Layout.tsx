import { lazy } from 'react'
import { Outlet } from 'react-router-dom'
import classNames from 'classnames'
import AppNavbar from './AppNavbar'
import AppFooter from './AppFooter'
import { XMAS_IS_HERE } from 'src/utils/misc'

const SnowfallEffect = lazy(() => import('./SnowfallEffect'))

export const MAIN_PADDING = 8
const MAIN_PADDING_CLASS = 'p-[8px]'

const Layout = ({ admin, padding }: { admin: boolean, padding: boolean }) => (
  <>
    <AppNavbar admin={admin} />
    <main id="main" className={classNames('flex-1 flex flex-col min-h-screen bg-primary', {
      [MAIN_PADDING_CLASS]: padding,
    })}>
      <Outlet />
    </main>
    {!admin && (
      <AppFooter />
    )}
    {XMAS_IS_HERE && <SnowfallEffect />}
  </>
)

Layout.defaultProps = {
  admin: false,
  padding: true,
}

export default Layout
