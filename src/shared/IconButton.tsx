import { IconButton as MuiIconButton } from '@material-tailwind/react/components/IconButton'

const EXTRA_CLASSNAME = 'rounded select-none outline-none focus:opacity-100'

const IconButton = (props: any) => (
  <MuiIconButton {...props} className={`${EXTRA_CLASSNAME} ${props.className}`}>
    {props.children}
  </MuiIconButton>
)

export default IconButton
