import { Alert as MuiAlert } from '@material-tailwind/react'
import { ReactNode } from 'react'
import style from './style.module.css'
import { onClose } from '@material-tailwind/react/types/components/alert'

const EXTRA_CLASSES = `z-10 overflow-y-auto bg-tertiary justify-between ${style.alert}`

const Alert = ({ children, className, ...props }: AlertProps) => (
  <MuiAlert className={`${EXTRA_CLASSES} ${className}`} {...props}>
    {children}
  </MuiAlert>
)

type AlertProps = {
  children: ReactNode
  className?: string
  open: boolean
  onClose?: onClose
  action?: ReactNode
}

export default Alert
