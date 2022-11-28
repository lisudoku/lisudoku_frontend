import { forwardRef } from 'react'
import { Textarea as MuiTextArea } from '@material-tailwind/react'

const EXTRA_CLASSNAME = 'rounded disabled:!border-gray-600 disabled:!border-2 disabled:!text-white !bg-black'

const LABEL_PROPS = {
  className: '!text-black'
}

const Textarea = forwardRef((props: any, ref) => (
  <MuiTextArea {...props}
               ref={ref}
               className={`${EXTRA_CLASSNAME} ${props.className}`}
               labelProps={{ ...LABEL_PROPS, ...props.labelProps }}
  >
    {props.children}
  </MuiTextArea>
))

export default Textarea
