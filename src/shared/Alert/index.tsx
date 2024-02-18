import { ReactNode } from 'react'
import { Alert as MuiAlert } from '@material-tailwind/react/components/Alert'
import { onClose } from '@material-tailwind/react/types/components/alert'
import styles from './styles.module.css'

const EXTRA_CLASSES = `z-10 overflow-y-auto bg-tertiary justify-between text-primary ${styles.alert}`

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
