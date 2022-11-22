import Button from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

const PermalinkButton = () => {
  return (
    <Button variant="text" color="gray" className="w-fit mt-1">
      <FontAwesomeIcon icon={faLink} />
      {' Copy puzzle permalink'}
    </Button>
  )
}

export default PermalinkButton
