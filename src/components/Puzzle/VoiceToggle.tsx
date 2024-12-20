import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Switch from '../../shared/Switch'
import { updateVoiceEnabled } from 'src/reducers/userData'
import { honeybadger } from '../HoneybadgerProvider'
import { Popover, PopoverContent, PopoverHandler } from 'src/shared/Popover'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'

const VoiceToggle = () => {
  const dispatch = useDispatch()
  const voiceEnabled = useSelector(state => state.userData.settings?.voiceEnabled ?? false)

  const handleSwitchChange = useCallback((checked: boolean) => {
    dispatch(updateVoiceEnabled(checked))
    if (checked) {
      honeybadger.notify({
        name: 'Voice mode activated',
      })
    }
  }, [dispatch])

  return (
    <div className="flex items-center gap-2">
      <Switch
        label="Use voice"
        checked={voiceEnabled}
        onChange={handleSwitchChange}
      />
      <Popover placement="bottom-start">
        <PopoverHandler>
          <FontAwesomeIcon icon={faCircleInfo} className="cursor-pointer" />
        </PopoverHandler>
        <PopoverContent className="bg-tertiary text-primary border-secondary">
          Note: Voice mode will download a large file
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default VoiceToggle
