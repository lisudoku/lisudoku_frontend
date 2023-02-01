import { Alert as MuiAlert } from '@material-tailwind/react'
import { ReactNode } from 'react'
import style from './style.module.css'

const EXTRA_CLASSES = `absolute z-10 h-full overflow-y-auto bg-gray-600 ${style.alert}`

const Alert = ({ children, onClose, ...props }: AlertProps) => {
  const newProps = { ...props }
  if (onClose) {
    newProps.dismissible = {
      onClose,
    }
  }

  return (
    <MuiAlert className={EXTRA_CLASSES} {...newProps}>
      {children}
    </MuiAlert>
  )
}

type AlertProps = {
  children: ReactNode
  show: boolean
  dismissible?: any
  onClose: Function
}

export default Alert
