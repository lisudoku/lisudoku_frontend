import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'src/hooks'
import { clearLoginData } from 'src/reducers/userData'

const LogoutPage = () => {
  const dispatch = useDispatch()
  const userToken = useSelector(state => state.userData.token)

  useEffect(() => { dispatch(clearLoginData()) }, [dispatch])

  if (userToken) {
    return null
  }
  return (
    <Navigate
      to="/login"
      replace
    />
  )
}

export default LogoutPage
