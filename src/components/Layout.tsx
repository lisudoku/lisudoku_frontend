import AppNavbar from './AppNavbar'
import { Outlet } from 'react-router-dom'
import AppFooter from './AppFooter'
import classNames from 'classnames'

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
  </>
)

Layout.defaultProps = {
  admin: false,
  padding: true,
}

export default Layout
