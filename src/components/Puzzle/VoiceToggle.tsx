import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Switch from '../../shared/Switch'
import { updateVoiceEnabled } from 'src/reducers/userData'
import { honeybadger } from '../HoneybadgerProvider'
import { Popover, PopoverContent, PopoverHandler } from 'src/shared/Popover'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import Typography from 'src/shared/Typography'

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
          <Typography variant="paragraph">
            Voice mode requires a one-time download of a large file, which will be stored in the browser's cache.
          </Typography>
          {navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrom') && (
            <Typography variant="paragraph">
              This feature might not work on some Safari browsers.
            </Typography>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default VoiceToggle
