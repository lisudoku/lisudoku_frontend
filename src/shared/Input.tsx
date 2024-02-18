import { Input as MuiInput } from '@material-tailwind/react/components/Input'
import { useCallback } from 'react'

const EXTRA_CLASSES  = '!text-primary'
const CONTAINER_CLASSES = 'min-w-0'

const Input = (props: any) => {
  const propsOnChange = props.onChange
  const propsType = props.type
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue
    if (propsType === 'number') {
      newValue = e.target.value === '' ? null : +e.target.value
    } else {
      newValue = e.target.value
    }
    propsOnChange?.(newValue)
  }, [propsType, propsOnChange])

  return (
    <MuiInput 
      {...props}
      color="cyan"
      className={`${EXTRA_CLASSES} ${props.className ?? ''}`}
      containerProps={{
        ...props.containerProps,
        className: `${CONTAINER_CLASSES} ${props.containerProps?.className ?? ''}`,
      }}
      onChange={onChange}
    >
      {props.children}
    </MuiInput>
  )
}

export default Input
