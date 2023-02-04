import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { SudokuVariantDisplay } from 'src/utils/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChessKnight } from '@fortawesome/free-solid-svg-icons'

const SudokuVariantCard = ({ variant, difficulty }: { variant: SudokuVariant, difficulty: SudokuDifficulty }) => (
  <div className="w-full sm:w-1/2 lg:w-1/4 p-1.5">
    <Link to={`/play/${variant}/${difficulty}`}>
      <div className="relative h-48 border rounded border-gray-700 cursor-pointer text-3xl bg-gray-800 hover:bg-cyan-900 hover:text-gray-300 hover:shadow-sm hover:shadow-gray-700">
        <div className="w-full h-full flex flex-col items-center justify-center pb-2">
          <span className={classNames('z-10', { 'pr-10': variant === SudokuVariant.Irregular })}>{SudokuVariantDisplay[variant]}</span>
          <span className={classNames('z-10', { 'pl-10': variant === SudokuVariant.Irregular })}>Sudoku</span>
        </div>
        <div className="absolute z-0 w-full h-full top-0 left-0">
          {variant === SudokuVariant.AntiKnight && (
            <>
              <FontAwesomeIcon icon={faChessKnight} size="sm" className="absolute top-5 left-5" />
              <FontAwesomeIcon icon={faChessKnight} size="sm" className="absolute bottom-5 right-5" />
            </>
          )}
        </div>
        <svg className="absolute text-lg z-0 w-full h-full top-0 left-0"
            style={{ fill: 'none', stroke: 'grey', strokeWidth: 1, strokeLinecap: 'square' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
          {variant === SudokuVariant.Diagonal && (
            <g className="opacity-60">
              <line x1="0" y1="0" x2="100" y2="100" />
              <line x1="100" y1="0" x2="0" y2="100" />
            </g>
          )}
          {variant === SudokuVariant.Arrow && (
            <g>
              <polyline points="53,36 53,25 60,19" />
              <polyline points="60,22 61,18 58,18.1" />
              <polyline points="54,63 54,72 48,78" />
              <polyline points="48,75 47.5,78.5 50,78.5" />
            </g>
          )}
          {variant === SudokuVariant.Killer && (
            <g>
              <polyline points="15,15 85,15 85,85 15,85 15,15" style={{ strokeDasharray: 3 }} />
              <text x="16" y="20" style={{ fill: 'white', stroke: 'none', fontSize: 4 }}>45</text>
            </g>
          )}
          {variant === SudokuVariant.Irregular && (
            <polyline points="70,15 70,49 30,49 30,74" />
          )}
          {variant === SudokuVariant.Kropki && (
            <g>
              <line x1="13" y1="49" x2="87" y2="49" />
              <ellipse cx="50" cy="49" rx="1" ry="1.8" style={{ fill: 'white', stroke: 'none' }} />
              <ellipse cx="45" cy="49" rx="1" ry="1.8" style={{ fill: 'black', stroke: 'white', strokeWidth: 0.5 }} />
              <ellipse cx="55" cy="49" rx="1" ry="1.8" style={{ fill: 'black', stroke: 'white', strokeWidth: 0.5 }} />
            </g>
          )}
          {variant === SudokuVariant.Thermo && (
            <g style={{ strokeWidth: 2 }}>
              <ellipse cx="90" cy="12" rx="3" ry="4" style={{ fill: 'grey' }} />
              <polyline points="90,12 75,12" />
              <ellipse cx="10" cy="88" rx="3" ry="4" style={{ fill: 'grey' }} />
              <polyline points="10,88 10,65" />
            </g>
          )}
          {variant === SudokuVariant.TopBot && (
            <polyline points="75,0 75,15 62,30 62,45 53,53 53,70 40,85 40,100" className="opacity-60" />
          )}
          {variant === SudokuVariant.Classic && (
            <g className="opacity-60">
              <line x1="33" y1="0" x2="33" y2="30" stroke="grey" />
              <line x1="33" y1="70" x2="33" y2="100" stroke="grey" />

              <line x1="66" y1="0" x2="66" y2="30" stroke="grey" />
              <line x1="66" y1="70" x2="66" y2="100" stroke="grey" />

              <line x1="0" y1="33" x2="27" y2="33" stroke="grey" />
              <line x1="73" y1="33" x2="100" y2="33" stroke="grey" />

              <line x1="0" y1="66" x2="27" y2="66" stroke="grey" />
              <line x1="73" y1="66" x2="100" y2="66" stroke="grey" />

              <g style={{ fill: 'white', stroke: 'none', fontSize: 6 }}>
                <text x="15" y="18">7</text>
                <text x="93" y="8">3</text>
                <text x="82" y="75">2</text>
                <text x="25" y="94">4</text>
              </g>
            </g>
          )}
          {variant === SudokuVariant.Mixed && (
            <g className="fill-gray-500 stroke-0">
              <text x="15" y="25" rotate={-15}>?</text>
              <text x="80" y="30" rotate={20}>?</text>
              <text x="60" y="90" rotate={15}>?</text>
            </g>
          )}
          {variant === SudokuVariant.ExtraRegions && (
            <g className="fill-gray-700 stroke-0">
                <rect x="7" y="30" width="33" height="18" />
                <rect x="42" y="30" width="51" height="18" />
            </g>
          )}
        </svg>
      </div>
    </Link>
  </div>
)

export default SudokuVariantCard
