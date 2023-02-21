import Button from '../Button'
import CopyToClipboard from '../CopyToClipboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { getPuzzleFullUrl } from 'src/utils/misc'

const PermalinkButton = ({ publicId }: { publicId: string }) => (
  <CopyToClipboard text={getPuzzleFullUrl(publicId)}>
    <Button variant="text" color="gray" className="w-full md:w-fit mt-2 md:mt-1">
      <FontAwesomeIcon icon={faLink} />
      {' Copy puzzle permalink'}
    </Button>
  </CopyToClipboard>
)

export default PermalinkButton
