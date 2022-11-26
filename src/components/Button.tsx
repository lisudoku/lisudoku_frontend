import { Button as MuiButton } from '@material-tailwind/react'
import { forwardRef } from 'react'

const EXTRA_CLASSNAME = 'rounded select-none outline-none focus:opacity-100'

const Button = forwardRef((props: any, ref) => (
  <MuiButton {...props} ref={ref} className={`${EXTRA_CLASSNAME} ${props.className}`}>
    {props.children}
  </MuiButton>
))

export default Button
