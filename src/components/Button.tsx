import { Button as MuiButton } from '@material-tailwind/react'

const EXTRA_CLASSNAME = 'rounded select-none outline-none focus:opacity-100'

const Button = (props: any) => (
  <MuiButton {...props} className={`${EXTRA_CLASSNAME} ${props.className}`}>
    {props.children}
  </MuiButton>
)

export default Button
