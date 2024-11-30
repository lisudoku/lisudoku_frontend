import { faCircle, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import {
  faBolt, faChessKing, faChessKnight, faLinesLeaning, faSquare, faThermometer4,
  faUpLong, faXmark, faCircle as faCircleSolid, faSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';
import { ConstraintType, SudokuConstraints } from 'src/types/sudoku';

interface ConstraintDisplayData {
  icon: ReactNode | null
  label: string
  description: (constraints: SudokuConstraints) => ReactNode
}

export const CONSTRAINTS_DISPLAY: { [key in ConstraintType]: ConstraintDisplayData } = {
  [ConstraintType.FixedNumber]: {
    icon: null,
    label: 'Given digit',
    description: ({ gridSize }: SudokuConstraints) => <>
      Place a digit from 1 to {gridSize} in each of the empty cells so
      that each digit appears exactly once in each row, column and outlined region.
    </>,
  },
  [ConstraintType.Regions]: {
    icon: null,
    label: 'Regions',
    description: () => null,
  },
  [ConstraintType.ExtraRegions]: {
    label: 'Extra Regions',
    icon: <FontAwesomeIcon icon={faSquare} size="sm" className="text-cyan-700" />,
    description: ({ gridSize }: SudokuConstraints) => <>
      Each blue region contains each digit from 1 to {gridSize}.
    </>,
  },
  [ConstraintType.Thermo]: {
    label: 'Thermometer',
    icon: <FontAwesomeIcon icon={faThermometer4} size="sm"/>,
    description: () => <>
      Each thermometer contains digits in increasing order from the bulb to the end.
    </>,
  },
  [ConstraintType.Arrow]: {
    label: 'Arrow',
    icon: <FontAwesomeIcon icon={faUpLong} size="sm"/>,
    description: ({ arrows }: SudokuConstraints) => <>
      The number placed in the arrow circle or oval must be the sum of digits placed
      in the cells that the arrow passes through. Digits may repeat on arrows.
      {arrows?.some(arrow => arrow.circleCells.length > 1) && (
        <>{' '}Each oval should be read as a two digit number left to right or top to bottom.</>
      )}
    </>,
  },
  [ConstraintType.Renban]: {
    label: 'Renban',
    icon: <FontAwesomeIcon icon={faLinesLeaning} size="sm"/>,
    description: () => <>
      Each gray line must contain a set of distinct, consecutive digits in any order.
    </>,
  },
  [ConstraintType.PrimaryDiagonal]: {
    label: 'Primary Diagonal',
    icon: <FontAwesomeIcon icon={faSlash} color="purple" />,
    description: ({ gridSize }: SudokuConstraints) => <>
      {' '}
      The purple primary diagonal must contain distinct digits from 1 to {gridSize}.
    </>,
  },
  [ConstraintType.SecondaryDiagonal]: {
    label: 'Secondary Diagonal',
    icon: <FontAwesomeIcon icon={faSlash} flip="horizontal" color="purple" />,
    description: ({ gridSize }: SudokuConstraints) => <>
      {' '}
      The purple secondary diagonal must contain distinct digits from 1 to {gridSize}.
    </>,
  },
  [ConstraintType.Diagonals]: { // This just represents both diagonals combined
    label: 'Diagonals',
    icon: <FontAwesomeIcon icon={faXmark} color="purple" />,
    description: ({ gridSize }: SudokuConstraints) => <>
      {' '}
      Each purple diagonal must contain distinct digits from 1 to {gridSize}.
    </>,
  },
  [ConstraintType.AntiKnight]: {
    label: 'Anti Knight',
    icon: <FontAwesomeIcon icon={faChessKnight} size="sm"/>,
    description: () => <>
      Cells a knight move away must not contain the same digit.
    </>,
  },
  [ConstraintType.AntiKing]: {
    label: 'Anti King',
    icon: <FontAwesomeIcon icon={faChessKing} size="sm"/>,
    description: () => <>
      Cells a king move away must not contain the same digit.
    </>,
  },
  [ConstraintType.KillerCage]: {
    label: 'Killer',
    icon: (
      <svg height={13} width={13} className="inline-block">
        <rect x="0" y="0" width="100%" height="100%" fill="transparent" stroke="white" strokeDasharray="2" />
      </svg>
    ),
    description: () => <>
      The sum of all numbers in a cage must match the small number in the corner of the cage.
      No number appears more than once in a cage.
    </>,
  },
  [ConstraintType.KropkiConsecutive]: {
    label: 'Kropki Consecutive',
    icon: <span className="fa-layers">
      <FontAwesomeIcon icon={faCircleSolid} color="white" size="sm" />
      <FontAwesomeIcon icon={faCircle} color="black" size="sm" />
    </span>,
    description: () => <>
      Adjacent cells containing digits whose difference is 1 are marked with a white circle.
    </>,
  },
  [ConstraintType.KropkiDouble]: {
    label: 'Kropki Double',
    icon: <span className="fa-layers">
      <FontAwesomeIcon icon={faCircleSolid} color="black" size="sm" />
      <FontAwesomeIcon icon={faCircle} color="white" size="sm" />
    </span>,
    description: () => <>
      Adjacent cells containing digits whose ratio is 2 are marked with a black circle.
    </>,
  },
  [ConstraintType.KropkiNegative]: {
    label: 'Kropki Negative',
    icon: <FontAwesomeIcon icon={faCircleXmark} size="sm"/>,
    description: () => <>
      Adjacent cells with no marking must not contain digits either whose difference is 1 or whose ratio is 2.
    </>,
  },
  [ConstraintType.Odd]: {
    label: 'Odd',
    icon: <FontAwesomeIcon icon={faCircleSolid} size="sm" color="lightgray" />,
    description: () => <>
      Cells with shaded circles contain odd digits.
    </>,
  },
  [ConstraintType.Even]: {
    label: 'Even',
    icon: <FontAwesomeIcon icon={faSquare} size="sm" color="lightgray" />,
    description: () => <>
      Cells with shaded squares contain even digits.
    </>,
  },
  [ConstraintType.TopBottom]: {
    label: 'Top-Bottom',
    icon: <FontAwesomeIcon icon={faBolt} size="sm" color="lightgray" />,
    description: ({ gridSize }: SudokuConstraints) => <>
      There are two sequences of numbers: from digit 1 in top row to digit {gridSize}{' '}
      in bottom row and from digit 1 in bottom row to digit {gridSize} in top row.
      A sequence has to have consecutive numbers touching by side or corner.
    </>,
  },
}
