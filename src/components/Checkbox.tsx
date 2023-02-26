import { forwardRef } from 'react'
import { Checkbox as MuiCheckbox } from '@material-tailwind/react'

const EXTRA_CLASSNAME = ''

const LABEL_PROPS = {
  className: 'text-white'
}

const CONTAINER_PROPS = {
  className: 'px-1 py-2'
}

const Checkbox = forwardRef((props: any, ref) => (
  <MuiCheckbox {...props}
            ref={ref}
            className={`${EXTRA_CLASSNAME} ${props.className}`}
            labelProps={{ ...LABEL_PROPS, ...props.labelProps }}
            containerProps={{ ...CONTAINER_PROPS, ...props.containerProps }}
  >
    {props.children}
  </MuiCheckbox>
))

export default Checkbox
