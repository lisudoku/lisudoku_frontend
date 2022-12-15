import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'src/hooks'

const EnsureLogin = () => {
  const userToken = useSelector(state => state.userData.token)

  return (
    userToken ? (
      <Outlet />
    ) : (
      <Navigate
        to="/login"
        replace
      />
    )
  )
}

export default EnsureLogin
