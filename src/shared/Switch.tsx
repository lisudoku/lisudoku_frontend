import { forwardRef, useCallback } from 'react'
import { Switch as MuiSwitch } from '@material-tailwind/react/components/Switch'
import classNames from 'classnames'

const EXTRA_CLASSES = 'outline-none checked:bg-highlight'
const LABEL_CLASSES = 'text-primary'
const CIRCLE_CLASSES = 'border-secondary peer-checked:border-primary'

const Switch = forwardRef((props: any, ref) => {
  const onChange = props.onChange
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked)
  }, [onChange])

  return (
    <MuiSwitch
      {...props}
      ref={ref}
      labelProps={{
        ...props.labelProps,
        className: classNames(props.labelProps?.className, LABEL_CLASSES),
      }}
      circleProps={{
        className: CIRCLE_CLASSES,
      }}
      onChange={handleChange}
      className={classNames(props.className, EXTRA_CLASSES)}
    >
      {props.children}
    </MuiSwitch>
  )
})

export default Switch
