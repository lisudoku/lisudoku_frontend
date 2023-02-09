import AppNavbar from './AppNavbar'
import { Outlet } from 'react-router-dom'
import AppFooter from './AppFooter'
import classNames from 'classnames'

const Layout = ({ admin, padding }: { admin: boolean, padding: boolean }) => (
  <>
    <AppNavbar admin={admin} />
    <main className={classNames('flex-1 flex flex-col', {
      'p-5': padding,
    })}>
      <Outlet />
    </main>
    <AppFooter admin={admin} />
  </>
)

Layout.defaultProps = {
  admin: false,
  padding: true,
}

export default Layout
