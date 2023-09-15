import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { updateIsOnline } from 'src/reducers/misc'

const OnlineStatusMonitor = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const handleOnline = () => dispatch(updateIsOnline(true))
    window.addEventListener('online', handleOnline)
    const handleOffline = () => dispatch(updateIsOnline(false))
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('online', handleOffline)
    }
  }, [dispatch])

  return <>{children}</>
}

export default OnlineStatusMonitor
