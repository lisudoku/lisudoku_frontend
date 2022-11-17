import classNames from 'classnames'
import { SudokuVariant } from 'src/types/common'

const SudokuVariantCard = ({ variant }: { variant: SudokuVariant }) => (
  <div className="w-full sm:w-1/2 md:w-1/3 p-2">
    <div className="relative h-48 border cursor-pointer text-3xl">
      <div className="w-full h-full flex flex-col items-center justify-center pb-2">
        <span className={classNames('z-10', { 'pr-10': variant === SudokuVariant.Irregular })}>{variant}</span>
        <span className={classNames('z-10', { 'pl-10': variant === SudokuVariant.Irregular })}>Sudoku</span>
      </div>
      <svg className="absolute text-lg z-0"
            style={{
              top: 0, left: 0, width: '100%', height: '100%', stroke: 'none', fill: 'white', strokeWidth: 1,
            }}
            viewBox="0 0 100 100" preserveAspectRatio="none"
      >
        {variant === SudokuVariant.Diagonal && (
          <g style={{ opacity: 0.6 }}>
            <line x1="0" y1="0" x2="100" y2="100" stroke="grey" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="grey" />
          </g>
        )}
        {variant === SudokuVariant.Arrow && (
          <g style={{ strokeWidth: 1, fill: 'none', stroke: 'grey', strokeLinecap: 'square' }}>
            <polyline points="53,36 53,25 60,19" />
            <polyline points="60,22 61,18 58,18.1" />
            <polyline points="54,63 54,72 48,78" />
            <polyline points="48,75 47.5,78.5 50,78.5" />
          </g>
        )}
        {variant === SudokuVariant.Killer && (
          <g style={{ strokeWidth: 1, fill: 'none', stroke: 'grey' }}>
            <polyline points="15,15 85,15 85,85 15,85 15,15" style={{ strokeDasharray: 3 }} />
            <text x="16" y="20" style={{ fill: 'white', stroke: 'none', fontSize: 4 }}>100</text>
          </g>
        )}
        {variant === SudokuVariant.Irregular && (
          <g style={{ strokeWidth: 1, fill: 'none', stroke: 'grey', strokeLinecap: 'square' }}>
            <polyline points="70,15 70,49 30,49 30,74" />
          </g>
        )}
      </svg>
    </div>
  </div>
)

export default SudokuVariantCard
