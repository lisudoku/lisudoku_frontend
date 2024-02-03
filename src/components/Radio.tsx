import { forwardRef, useCallback } from 'react'
import classNames from 'classnames'
import { Radio as MuiRadio } from '@material-tailwind/react'

const EXTRA_CLASSNAME = 'text-highlight checked:border-highlight'

const LABEL_CLASSNAME = 'text-primary'

const CONTAINER_PROPS = {
  className: 'px-1 py-2'
}

const Radio = forwardRef((props: any, ref) => {
  const onChange = props.onChange
  const handleChange = useCallback((e: React.ChangeEvent<Record<string, unknown>>) => {
    const elementId = e.target.id
    onChange?.(elementId)
  }, [onChange])

  return (
    <MuiRadio {...props}
              ref={ref}
              color="cyan"
              className={`${EXTRA_CLASSNAME} ${props.className}`}
              labelProps={{
                ...props.labelProps,
                className: classNames(LABEL_CLASSNAME, props.labelProps?.className),
              }}
              containerProps={{ ...CONTAINER_PROPS, ...props.containerProps }}
              onChange={handleChange}
    >
      {props.children}
    </MuiRadio>
  )
})

export default Radio
