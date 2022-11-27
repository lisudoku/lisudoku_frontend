import AppNavbar from './AppNavbar'
import { Outlet } from 'react-router-dom'
import AppFooter from './AppFooter'

const Layout = ({ admin }: { admin: boolean }) => (
  <>
    <AppNavbar admin={admin} />
    <main className="flex-1 p-5 flex flex-col">
      <Outlet />
    </main>
    <AppFooter admin={admin} />
  </>
)

Layout.defaultProps = {
  admin: false,
}

export default Layout
