import { ButtonProps, Button as MuiButton } from '@material-tailwind/react'
import { forwardRef } from 'react'

const EXTRA_CLASSNAME = 'rounded select-none outline-none focus:opacity-100 focus:ring-0'

const Button = forwardRef((props: ButtonProps, ref: React.ForwardedRef<HTMLButtonElement | null>) => (
  <MuiButton {...props}
             ref={ref}
             size={props.size || 'sm'}
             color={props.color || 'blue-gray'}
             className={`${EXTRA_CLASSNAME} ${props.className}`}>
    {props.children}
  </MuiButton>
))

export default Button
