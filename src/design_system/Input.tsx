import { Input as MuiInput } from '@material-tailwind/react/components/Input'
import { useCallback } from 'react'

const EXTRA_CLASSES  = '!text-primary disabled:bg-secondary disabled:text-primary'
const CONTAINER_CLASSES = 'min-w-0'

const Input = ({ onChange: propsOnChange, className, containerProps, ...props }: any) => {
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
      color="cyan"
      className={`${EXTRA_CLASSES} ${className ?? ''}`}
      containerProps={{
        ...containerProps,
        className: `${CONTAINER_CLASSES} ${containerProps?.className ?? ''}`,
      }}
      onChange={onChange}
      {...props}
    >
      {props.children}
    </MuiInput>
  )
}

export default Input
