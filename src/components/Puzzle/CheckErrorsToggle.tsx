import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Switch from '../../shared/Switch'
import { updateCheckErrors } from 'src/reducers/userData'

const CheckErrorsToggle = () => {
  const dispatch = useDispatch()
  const checkErrors = useSelector(state => state.userData.settings?.checkErrors ?? true)

  const handleSwitchChange = useCallback((checked: boolean) => {
    dispatch(updateCheckErrors(checked))
  }, [dispatch])

  return (
    <Switch
      label="Check errors"
      checked={checkErrors}
      onChange={handleSwitchChange}
    />
  )
}

export default CheckErrorsToggle
