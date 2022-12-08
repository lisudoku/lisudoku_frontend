import { useCallback, useRef, useState } from 'react'
import { Popover, PopoverHandler, PopoverContent } from '@material-tailwind/react'
import Button from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { getPuzzleFullUrl } from 'src/utils/misc'

const PermalinkButton = ({ publicId }: { publicId: string }) => {
  const [ open, setOpen ] = useState(false)

  const timerRef = useRef<NodeJS.Timeout>()
  const handleClick = useCallback(() => {
    const puzzleUrl = getPuzzleFullUrl(publicId)
    navigator.clipboard.writeText(puzzleUrl)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setOpen(true)
    timerRef.current = setTimeout(() => {
      setOpen(false)
    }, 2000)
  }, [publicId])

  return (
    <Popover
      open={open}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0, y: 35 },
      }}
    >
      <PopoverHandler onClick={handleClick}>
        <Button variant="text" color="gray" className="w-full md:w-fit mt-2 md:mt-1">
          <FontAwesomeIcon icon={faLink} />
          {' Copy puzzle permalink'}
        </Button>
      </PopoverHandler>
      <PopoverContent className="text-white bg-gray-500 rounded border-none">
        Puzzle URL copied to the clipboard
      </PopoverContent>
    </Popover>
  )
}

export default PermalinkButton
