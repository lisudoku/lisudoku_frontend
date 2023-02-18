import { Alert as MuiAlert } from '@material-tailwind/react'
import { ReactNode } from 'react'
import style from './style.module.css'

const EXTRA_CLASSES = `z-10 overflow-y-auto bg-gray-600 ${style.alert}`

const Alert = ({ children, className, onClose, ...props }: AlertProps) => {
  const newProps = { ...props }
  if (onClose) {
    newProps.dismissible = {
      onClose,
    }
  }

  return (
    <MuiAlert className={`${EXTRA_CLASSES} ${className}`} {...newProps}>
      {children}
    </MuiAlert>
  )
}

type AlertProps = {
  children: ReactNode
  className?: string
  show: boolean
  dismissible?: any
  onClose?: Function
}

export default Alert
