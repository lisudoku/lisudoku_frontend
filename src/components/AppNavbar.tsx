import { Link, useLocation } from 'react-router-dom'
import { userToken, userName } from 'src/utils/auth'

const AppNavbar = () => {
  useLocation()

  return (
    <nav className="h-14 px-6 flex items-center justify-between">
      <div className="flex gap-10">
        <a href="/" className="flex items-center text-3xl">
          lisudoku
        </a>
        <a href="/#" className="flex items-center text-medium uppercase pt-1">
          Play
        </a>
        <a href="/#" className="flex items-center text-medium uppercase pt-1">
          Learn
        </a>
      </div>
      <div className="flex gap-4 text-medium items-center uppercase">
        {userToken() ? (
          <>
            <div className="text-base">{userName()}</div>
            <Link to="./logout">Logout</Link>
          </>
        ) : (
          <>
            <Link to="./login">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default AppNavbar
