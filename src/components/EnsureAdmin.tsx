import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'src/hooks'

const EnsureAdmin = () => {
  const userAdmin = useSelector(state => state.userData.admin)

  return (
    userAdmin ? (
      <Outlet />
    ) : (
      <Navigate to="/login" replace />
    )
  )
}

export default EnsureAdmin
