import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Switch from '../../shared/Switch'
import { updateShowPeers } from 'src/reducers/userData'

const ShowPeersToggle = () => {
  const dispatch = useDispatch()
  const showPeers = useSelector(state => state.userData.settings?.showPeers ?? false)

  const handleSwitchChange = useCallback((checked: boolean) => {
    dispatch(updateShowPeers(checked))
  }, [dispatch])

  return (
    <Switch
      label="Show connected cells"
      checked={showPeers}
      onChange={handleSwitchChange}
    />
  )
}

export default ShowPeersToggle
