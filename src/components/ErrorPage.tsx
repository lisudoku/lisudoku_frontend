import { Typography } from '@material-tailwind/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

const ErrorPage = () => (
  <div className="w-full pt-20 text-center">
    <Typography variant="h4" className="font-normal mb-3">
      Something went wrong
    </Typography>
    <FontAwesomeIcon icon={faCircleExclamation} size="4x" color="red" />
  </div>
)

export default ErrorPage
