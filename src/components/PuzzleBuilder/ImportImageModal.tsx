import { useState } from 'react';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@material-tailwind/react';
import Button from 'src/shared/Button';
import Input from 'src/shared/Input';
import Typography from 'src/shared/Typography';
import { honeybadger } from '../HoneybadgerProvider';

const SUDOKU_VISION_API_ENDPOINT = 'https://vision.lisudoku.xyz/parse_sudoku_image'
// const SUDOKU_VISION_API_ENDPOINT = 'http://localhost:8080/parse_sudoku_image'

interface ImportImageModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (gridString: string) => void
  isAdmin: boolean
}

const ImportImageModal = ({ open, onClose, onSuccess, isAdmin }: ImportImageModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  if (open === false) {
    if (error !== undefined) {
      setError(undefined)
    }
    if (isSubmitting === true) {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    if (formData.get('file_url') === '') {
      formData.delete('file_url')
    }
    const file = formData.get('file_content') as File
    if (file.size === 0) {
      formData.delete('file_content')
    }

    if (!formData.has('file_url') && !formData.has('file_content')) {
      setError('Please provide the image')
      return
    }

    setIsSubmitting(true)
    setError(undefined)

    const response = await fetch(SUDOKU_VISION_API_ENDPOINT, {
      method: 'post',
      body: formData,
    })

    setIsSubmitting(false)
    const body = await response.json()

    if (!isAdmin) {
      const requestParams = new URLSearchParams(
        formData as unknown as Record<string, string>,
      ).toString();
      honeybadger.notify({
        name: 'Attempted import puzzle from image',
        context: {
          request: requestParams,
          response: body,
        },
      })
    }

    if (response.status !== 200) {
      const errorMessage = body.error ?? 'Something went wrong while processing the image'
      setError(errorMessage)
      return
    }

    const gridString = body.grid
    onSuccess(gridString)
  }

  return (
    <Dialog
      open={open}
      handler={onClose}
      size="md"
      className="bg-tertiary text-primary"
    >
      <form onSubmit={onSubmit}>
        <DialogHeader className="text-primary">Import puzzle from image</DialogHeader>
        <DialogBody className="text-primary flex flex-col gap-3">
          <Typography variant="paragraph" className="mb-3">
            Upload a classic sudoku screenshot or paste its URL.
          </Typography>
          <Input type="file" name="file_content" label="Image file" color="white" />
          <div className="w-full flex justify-center">
            - or -
          </div>
          <Input name="file_url" label="Image URL" color="white" />
          <input type="hidden" name="only_given_digits" value="true" />

          {error !== undefined && (
            <div>
              <Typography variant="paragraph" color="red">
                Error: {error}
              </Typography>
              <Typography variant="paragraph" color="red">
                Keep in mind that we expect Classic Sudoku puzzles and preferably screenshots.
              </Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

export default ImportImageModal
