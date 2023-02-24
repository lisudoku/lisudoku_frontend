import { SudokuConstraints } from 'src/types/sudoku'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChessKnight } from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'

const PuzzleCardIcons = ({ constraints }: { constraints: SudokuConstraints }) => (
  <div className="flex gap-x-1">
    {constraints.antiKnight && (
      <div><FontAwesomeIcon icon={faChessKnight} size="sm" title="Anti Knight" /></div>
    )}
    {constraints.kropkiNegative && (
      <div><FontAwesomeIcon icon={faCircleXmark} size="sm" title="Kropki Negative" /></div>
    )}
  </div>
)

export default PuzzleCardIcons
