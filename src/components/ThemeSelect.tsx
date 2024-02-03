import _ from 'lodash'
import { Option, Select } from './Select'
import { useDispatch, useSelector } from 'src/hooks'
import { useCallback } from 'react'
import { updateTheme } from 'src/reducers/userData'
import { ThemeOption } from './ThemeProvider'

const ThemeOptionDisplay: { [key in ThemeOption]: string } = {
  [ThemeOption.Light]: 'Light',
  [ThemeOption.Dark]: 'Dark',
  [ThemeOption.System]: 'Auto',
}

export const ThemeSelect = () => {
  const dispatch = useDispatch()
  const value = useSelector(state => state.userData.settings?.theme)
  const onChange = useCallback((theme: ThemeOption) => {
    dispatch(updateTheme(theme))
  }, [dispatch])

  return (
    <Select
      value={value}
      onChange={onChange}
      label="Theme"
    >
      {_.values(ThemeOption).map(value => (
        <Option key={value} value={value}>{ThemeOptionDisplay[value]}</Option>
      ))}
    </Select>
  )
}
