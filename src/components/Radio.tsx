import { forwardRef, useCallback } from 'react'
import { Radio as MuiRadio } from '@material-tailwind/react'

const EXTRA_CLASSNAME = ''

const LABEL_PROPS = {
  className: 'text-white'
}

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
              labelProps={{ ...LABEL_PROPS, ...props.labelProps }}
              containerProps={{ ...CONTAINER_PROPS, ...props.containerProps }}
              onChange={handleChange}
    >
      {props.children}
    </MuiRadio>
  )
})

export default Radio
