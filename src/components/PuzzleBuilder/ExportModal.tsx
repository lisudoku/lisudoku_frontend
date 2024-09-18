import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@material-tailwind/react';
import { useMemo, useState } from 'react';
import Button from 'src/shared/Button';
import Input from 'src/shared/Input';
import Radio from 'src/shared/Radio';
import { SudokuConstraints } from 'src/types/sudoku';
import { getAllFormats, SudokuDataFormat, transformSudoku } from 'sudoku-formats';
import CopyToClipboard from '../CopyToClipboard';
import { buildLisudokuPuzzleUrl, buildLisudokuSolverUrl } from 'src/utils/import';
import { honeybadger } from '../HoneybadgerProvider';
import { isGridString } from 'src/utils/sudoku';

const FORMATS = getAllFormats()

const CopiableInput = ({ url }: { url?: string }) => (
  <>
    {url ? (
      <div className="flex gap-1">
      <Input value={url} label="URL" disabled />
      <CopyToClipboard text={url} className="border-solid">
        <Button>
          Copy
        </Button>
      </CopyToClipboard>
    </div>
    ) : (
      'error'
    )}
  </>
)

interface ExportModalProps {
  open: boolean
  onClose: () => void
  constraints: SudokuConstraints
}

const ExportModal = ({ open, onClose, constraints }: ExportModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState(SudokuDataFormat.Lisudoku)

  const transformResult = useMemo(() => (
    transformSudoku({ constraints, fromFormat: SudokuDataFormat.Lisudoku, toFormat: selectedFormat })
  ), [constraints, selectedFormat])
  const { url, dataString, error } = transformResult

  if (error !== undefined) {
    honeybadger.notify({
      name: 'Puzzle export error',
      context: {
        result: transformResult,
        constraints,
      },
    })
  }
  
  return (
    <Dialog
      open={open}
      handler={onClose}
      size="lg"
      className="bg-tertiary text-primary"
    >
      <DialogHeader className="text-primary">Export puzzle</DialogHeader>
      <DialogBody className="text-primary flex flex-col gap-3">
        <div>
          <label>
            <b>Destination</b>
          </label>
          <div className="flex gap-3">
            {FORMATS.map(({ format }) => (
              <Radio
                name="format"
                label={format}
                checked={format === selectedFormat}
                onChange={() => setSelectedFormat(format)}
                key={format}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label>
            <b>Result</b>
          </label>
          {selectedFormat === SudokuDataFormat.Lisudoku ? (
            <>
              <CopiableInput url={buildLisudokuPuzzleUrl(dataString!)} />
              <CopiableInput url={buildLisudokuSolverUrl(dataString!)} />
              {isGridString(dataString!) && (
                <CopiableInput url={dataString} />
              )}
            </>
          ) : (
            <CopiableInput url={url} />
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default ExportModal
