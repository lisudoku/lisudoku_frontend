import { useCallback } from 'react'
import { useDispatch, useSelector } from 'src/hooks'
import Switch from '../../design_system/Switch'
import { updateShowSplitInputModes } from 'src/reducers/userData'

export const ShowSplitInputModesToggle = () => {
  const dispatch = useDispatch()
  const showSplitInputModes = useSelector(state => state.userData.settings?.showSplitInputModes ?? false)

  const handleSwitchChange = useCallback((checked: boolean) => {
    dispatch(updateShowSplitInputModes(checked))
  }, [dispatch])

  return (
    <Switch
      label="Show split input modes"
      checked={showSplitInputModes}
      onChange={handleSwitchChange}
    />
  )
}
