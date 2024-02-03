import { ReactElement } from 'react'
import { useCallback, useRef, useState } from 'react'
import _ from 'lodash'
import { Popover, PopoverHandler, PopoverContent } from '@material-tailwind/react'

const CopyToClipboard = ({ children, text }: CopyToClipboardProps) => {
  const [ open, setOpen ] = useState(false)

  const timerRef = useRef<NodeJS.Timeout>()
  const handleClick = useCallback(() => {
    const data = _.isFunction(text) ? text() : text
    navigator.clipboard.writeText(data)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setOpen(true)
    timerRef.current = setTimeout(() => {
      setOpen(false)
    }, 2000)
  }, [text])

  return (
    <Popover
      open={open}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0, y: 35 },
      }}
    >
      <PopoverHandler onClick={handleClick}>
        {children}
      </PopoverHandler>
      <PopoverContent className="text-primary bg-tertiary rounded border-none">
        URL copied to the clipboard
      </PopoverContent>
    </Popover>
  )
}

type CopyToClipboardProps = {
  children: ReactElement
  text: Function | string
}

export default CopyToClipboard
