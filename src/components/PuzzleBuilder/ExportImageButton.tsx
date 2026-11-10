import { type RefObject, useCallback, useState } from 'react'
import Button from 'src/design_system/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload } from '@fortawesome/free-solid-svg-icons'

interface ExportImageButtonProps {
  onClick: () => void
  gridWrapperRef: RefObject<HTMLDivElement>
}

const downloadImage = (image: string, { name = 'puzzle', extension = 'png' } = {}) => {
  const a = document.createElement('a')
  a.href = image
  a.download = `${name}.${extension}`
  a.click()
}

export const ExportImageButton = ({ onClick, gridWrapperRef }: ExportImageButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = useCallback(async () => {
    setIsLoading(true)

    onClick()

    const html2canvas = (await import('html2canvas')).default

    // Use the timeout to wait for the dispatch
    setTimeout(async () => {
      if (gridWrapperRef.current) {
        const canvas = await html2canvas(gridWrapperRef.current)
        const imageData = canvas.toDataURL('image/png', 1.0)
        downloadImage(imageData)
      }
    }, 1)

    setIsLoading(false)
  }, [onClick])

  return (
    <Button
      className="w-1/2"
      variant="outlined"
      onClick={handleClick}
      disabled={isLoading}
      aria-label="Export the current Sudoku puzzle to an image"
    >
      <FontAwesomeIcon icon={faUpload} />{' '}
      {isLoading ? 'Exporting...' : 'Export image'}
    </Button>
  )
}
