import { SudokuConstraints } from 'src/types/sudoku'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChessKnight, faChessKing, faBolt } from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'

const PuzzleCardIcons = ({ constraints }: { constraints: SudokuConstraints }) => (
  <div className="flex gap-x-1">
    {constraints.antiKnight && (
      <div><FontAwesomeIcon icon={faChessKnight} size="sm" title="Anti Knight" /></div>
    )}
    {constraints.antiKing && (
      <div><FontAwesomeIcon icon={faChessKing} size="sm" title="Anti King" /></div>
    )}
    {constraints.kropkiNegative && (
      <div><FontAwesomeIcon icon={faCircleXmark} size="sm" title="Kropki Negative" /></div>
    )}
    {constraints.topBottom && (
      <div><FontAwesomeIcon icon={faBolt} size="sm" title="Top-Bottom" /></div>
    )}
  </div>
)

export default PuzzleCardIcons
