import Typography from 'src/shared/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

const ErrorPage = ({ text }: { text: string }) => (
  <div className="w-full pt-20 text-center">
    <Typography variant="h4" className="font-normal mb-3">
      {text}
    </Typography>
    <FontAwesomeIcon icon={faCircleExclamation} size="4x" color="red" />
  </div>
)

ErrorPage.defaultProps = {
  text: 'Something went wrong',
}

export default ErrorPage
