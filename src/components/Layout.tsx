import AppNavbar from './AppNavbar'
import { Outlet } from 'react-router-dom'
import AppFooter from './AppFooter'

const Layout = () => (
  <>
    <AppNavbar />
    <main className="flex-1 p-5 flex flex-col">
      <Outlet />
    </main>
    <AppFooter />
  </>
)

export default Layout
