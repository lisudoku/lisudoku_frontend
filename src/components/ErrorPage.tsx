import { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import Typography from 'src/design_system/Typography'

const ErrorPage = ({ children = <>Something went wrong</> }: { children?: ReactNode }) => (
  <div className="w-full pt-20 text-center">
    <Typography variant="h4" className="font-normal mb-3">
      {children}
    </Typography>
    <FontAwesomeIcon icon={faCircleExclamation} size="4x" color="red" />
  </div>
)

export default ErrorPage
