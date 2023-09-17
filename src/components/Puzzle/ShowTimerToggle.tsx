import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Switch from '../Switch'
import { updateShowTimer } from 'src/reducers/userData'

const ShowTimerToggle = () => {
  const dispatch = useDispatch()
  const showTimer = useSelector(state => state.userData.settings?.showTimer ?? true)

  const handleSwitchChange = useCallback((checked: boolean) => {
    dispatch(updateShowTimer(checked))
  }, [dispatch])

  return (
    <Switch
      label="Show timer"
      checked={showTimer}
      onChange={handleSwitchChange}
    />
  )
}

export default ShowTimerToggle
