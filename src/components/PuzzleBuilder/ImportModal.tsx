import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@material-tailwind/react';
import { useState } from 'react';
import Button from 'src/shared/Button';
import Input from 'src/shared/Input';
import Typography from 'src/shared/Typography';
import { FORMATS } from 'sudoku-formats';

const LISUDOKU_EXAMPLE_1 = 'https://lisudoku.xyz/e?import=N4Ig5gTglgJgylAXgUxA...'
const LISUDOKU_EXAMPLE_2 = 'https://lisudoku.xyz/p/4pyPjYdnlzJyUvFPVToy'
const FPUZZLES_EXAMPLE = 'https://www.f-puzzles.com/?load=N4IgzglgXgpiB...'
const GRID_STRING_EXAMPLE = '0003100002000040'

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (url: string) => Promise<void>
}

const ImportModal = ({ open, onClose, onConfirm }: ImportModalProps) => {
  const sources = FORMATS.map(({ format }) => format).join(', ')
  const [input, setInput] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  if (open === false && input.length > 0) {
    setInput('')
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsImporting(true)
    try {
      await onConfirm(input)
    }
    finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog
      open={open}
      // Prevent closing the import modal if the import method alerts
      handler={isImporting ? (() => {}) : onClose}
      size="md"
      className="bg-tertiary text-primary"
    >
      <form onSubmit={onSubmit}>
        <DialogHeader className="text-primary">Import puzzle</DialogHeader>
        <DialogBody className="text-primary flex flex-col gap-3">
          <Input color="white" label="Enter puzzle data here" value={input} onChange={setInput} />
          <div>
            <Typography>
              Valid formats: {sources}.
            </Typography>
            <Typography>
              Works with URL shortener (tinyurl) links too.
            </Typography>
            Examples
            <ul className="list-disc pl-4">
              <li><code>{GRID_STRING_EXAMPLE}</code> (4x4 grid string)</li>
              <li><code>{LISUDOKU_EXAMPLE_1}</code></li>
              <li><code>{LISUDOKU_EXAMPLE_2}</code></li>
              <li><code>{FPUZZLES_EXAMPLE}</code></li>
            </ul>
          </div>
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
          >
            Import
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

export default ImportModal
