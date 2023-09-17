import { forwardRef, useCallback } from 'react'
import { Switch as MuiSwitch } from '@material-tailwind/react'
import classNames from 'classnames'

const EXTRA_CLASSES = 'outline-0'
const LABEL_CLASSES = 'text-gray-500'

const Switch = forwardRef((props: any, ref) => {
  const onChange = props.onChange
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked)
  }, [onChange])

  return (
    <MuiSwitch
      {...props}
      ref={ref}
      color="blue-gray"
      labelProps={{
        ...props.labelProps,
        className: classNames(props.labelProps?.className, LABEL_CLASSES),
      }}
      onChange={handleChange}
      className={classNames(props.className, EXTRA_CLASSES)}
    >
      {props.children}
    </MuiSwitch>
  )
})

export default Switch
