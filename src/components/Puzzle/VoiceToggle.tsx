import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Switch from '../../shared/Switch'
import { updateVoiceEnabled } from 'src/reducers/userData'

const VoiceToggle = () => {
  const dispatch = useDispatch()
  const voiceEnabled = useSelector(state => state.userData.settings?.voiceEnabled ?? false)

  const handleSwitchChange = useCallback((checked: boolean) => {
    dispatch(updateVoiceEnabled(checked))
  }, [dispatch])

  return (
    <Switch
      label="Use voice"
      checked={voiceEnabled}
      onChange={handleSwitchChange}
    />
  )
}

export default VoiceToggle
