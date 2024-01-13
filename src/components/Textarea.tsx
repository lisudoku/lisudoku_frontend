import { forwardRef } from 'react'
import { Textarea as MuiTextArea, TextareaProps } from '@material-tailwind/react'

const EXTRA_CLASSNAME = 'rounded !bg-none !text-primary border-primary focus:border-primary'

const LABEL_PROPS = {
  className: '!text-primary before:border-primary peer-focus:before:!border-primary after:border-primary peer-focus:after:!border-primary'
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
