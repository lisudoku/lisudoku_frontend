import { Input as MuiInput } from '@material-tailwind/react'
import { useCallback } from 'react'

const EXTRA_CLASSES  = '!text-white'
const CONTAINER_CLASSES = 'min-w-0'

const Input = (props: any) => {
  const propsOnChange = props.onChange
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? null : +e.target.value
    propsOnChange?.(newValue)
  }, [propsOnChange])

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