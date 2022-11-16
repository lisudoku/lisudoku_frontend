import { Outlet, Navigate } from 'react-router-dom'
import { userToken } from 'src/utils/auth'

const EnsureLogin = () => (
  userToken() || true ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
    />
  )
)

export default EnsureLogin
