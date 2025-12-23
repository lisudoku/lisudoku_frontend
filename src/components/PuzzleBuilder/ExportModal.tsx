import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@material-tailwind/react';
import { useCallback, useMemo, useState } from 'react';
import Button from 'src/design_system/Button';
import Input from 'src/design_system/Input';
import Radio from 'src/design_system/Radio';
import { FORMATS, SudokuDataFormat, transformSudoku } from 'sudoku-formats';
import CopyToClipboard from '../CopyToClipboard';
import { buildLisudokuPuzzleUrl, buildLisudokuSolverUrl } from 'src/utils/import';
import { honeybadger } from '../HoneybadgerProvider';
import { detectConstraints, isGridString } from 'src/utils/sudoku';
import { SudokuConstraints } from 'lisudoku-solver';

interface CopiableInputProps {
  url?: string
  onCopy: (url: string) => void
}

const CopiableInput = ({ url, onCopy }: CopiableInputProps) => (
  <>
    {url ? (
      <div className="flex gap-1">
      <Input value={url} label="URL" disabled />
      <CopyToClipboard text={url} onCopy={onCopy} className="border-solid">
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

  const onCopy = useCallback((url: string) => {
    honeybadger.notify({
      name: 'Puzzle export copy',
      context: {
        url,
        variant: detectConstraints(constraints).variant,
        result: transformResult,
        constraints,
      },
    })
  }, [transformResult, constraints])
  
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
            {FORMATS.filter(({ format }) => format !== SudokuDataFormat.GridString).map(({ format }) => (
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
              <CopiableInput url={buildLisudokuPuzzleUrl(dataString!)} onCopy={onCopy} />
              <CopiableInput url={buildLisudokuSolverUrl(dataString!)} onCopy={onCopy} />
              {isGridString(dataString!) && (
                <CopiableInput url={dataString} onCopy={onCopy} />
              )}
            </>
          ) : (
            <CopiableInput url={url} onCopy={onCopy} />
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
