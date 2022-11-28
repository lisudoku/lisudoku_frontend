import { forwardRef } from 'react'
import { Radio as MuiRadio } from '@material-tailwind/react'

const EXTRA_CLASSNAME = ''

const LABEL_PROPS = {
  className: 'text-white'
}

const CONTAINER_PROPS = {
  className: 'p-2'
}

const Radio = forwardRef((props: any, ref) => (
  <MuiRadio {...props}
            ref={ref}
            className={`${EXTRA_CLASSNAME} ${props.className}`}
            labelProps={{ ...LABEL_PROPS, ...props.labelProps }}
            containerProps={{ ...CONTAINER_PROPS, ...props.containerProps }}
  >
    {props.children}
  </MuiRadio>
))

export default Radio
