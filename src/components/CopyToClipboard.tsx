import { ReactElement } from 'react'
import { useCallback, useRef, useState } from 'react'
import { isFunction } from 'lodash-es'
import { Popover, PopoverContent, PopoverHandler } from 'src/shared/Popover'

const CopyToClipboard = ({ children, text }: CopyToClipboardProps) => {
  const [ open, setOpen ] = useState(false)

  const timerRef = useRef<number>()
  const handleClick = useCallback(() => {
    const data = isFunction(text) ? text() : text
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
