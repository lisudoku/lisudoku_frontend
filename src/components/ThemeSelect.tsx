import { values } from 'lodash-es'
import { Option, Select } from '../shared/Select'
import { useDispatch } from 'src/hooks'
import { useCallback } from 'react'
import { updateTheme } from 'src/reducers/userData'
import { ThemeOption, useTheme } from './ThemeProvider'

const ThemeOptionDisplay: { [key in ThemeOption]: string } = {
  [ThemeOption.Light]: 'Light',
  [ThemeOption.Dark]: 'Dark',
  [ThemeOption.System]: 'Auto',
}

export const ThemeSelect = () => {
  const dispatch = useDispatch()
  const { themeOption: value } = useTheme()
  const onChange = useCallback((theme: ThemeOption) => {
    dispatch(updateTheme(theme))
  }, [dispatch])

  return (
    <Select
      value={value}
      onChange={onChange}
      label="Theme"
    >
      {values(ThemeOption).map(value => (
        <Option key={value} value={value}>{ThemeOptionDisplay[value]}</Option>
      ))}
    </Select>
  )
}
