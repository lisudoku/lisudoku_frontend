import { forwardRef } from 'react'
import { Textarea as MuiTextArea, TextareaProps } from '@material-tailwind/react'

const EXTRA_CLASSNAME = 'rounded disabled:!border-gray-600 disabled:!border-2 disabled:!text-white !bg-black !text-white'

const LABEL_PROPS = {
  className: '!text-white'
}

interface TextAreaProps extends TextareaProps {}

const Textarea = forwardRef((props: TextAreaProps, ref: React.ForwardedRef<HTMLDivElement | null>) => (
  <MuiTextArea {...props}
               ref={ref}
               className={`${EXTRA_CLASSNAME} ${props.className}`}
               labelProps={{ ...LABEL_PROPS, ...props.labelProps }}
  >
    {props.children}
  </MuiTextArea>
))

export default Textarea
