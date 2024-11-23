import classNames from 'classnames'
import { ReactElement } from 'react'
import { useCallback, useRef, useState } from 'react'
import { isFunction } from 'lodash-es'
import { Popover, PopoverContent, PopoverHandler } from 'src/shared/Popover'

const CopyToClipboard = ({ children, text, className, onCopy }: CopyToClipboardProps) => {
  const [ open, setOpen ] = useState(false)

  const timerRef = useRef<NodeJS.Timeout>()
  const handleClick = useCallback(() => {
    const data = isFunction(text) ? text() : text
    navigator.clipboard.writeText(data)
    onCopy?.(data)
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
      <PopoverContent className={classNames('text-primary bg-tertiary rounded border-none border-primary z-[1000000]', className)}>
        Copied to the clipboard
      </PopoverContent>
    </Popover>
  )
}

type CopyToClipboardProps = {
  children: ReactElement
  text: Function | string
  className?: string
  onCopy?: (text: string) => void
}

export default CopyToClipboard
