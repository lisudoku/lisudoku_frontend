import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SudokuDifficulty, SudokuVariant } from 'src/types/sudoku'
import { SudokuVariantDisplay } from 'src/utils/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChessKnight, faChessKing } from '@fortawesome/free-solid-svg-icons'

const variantCardGraphics: Record<SudokuVariant, ReactNode> = {
  [SudokuVariant.Classic]: (
    <g className="opacity-60">
      <line x1="33" y1="0" x2="33" y2="30" stroke="grey" />
      <line x1="33" y1="70" x2="33" y2="100" stroke="grey" />

      <line x1="66" y1="0" x2="66" y2="30" stroke="grey" />
      <line x1="66" y1="70" x2="66" y2="100" stroke="grey" />

      <line x1="0" y1="33" x2="27" y2="33" stroke="grey" />
      <line x1="73" y1="33" x2="100" y2="33" stroke="grey" />

      <line x1="0" y1="66" x2="27" y2="66" stroke="grey" />
      <line x1="73" y1="66" x2="100" y2="66" stroke="grey" />

      <g className="fill-digit-fixed stroke-none text-[6px]">
        <text x="15" y="18">7</text>
        <text x="93" y="8">3</text>
        <text x="82" y="75">2</text>
        <text x="25" y="94">4</text>
      </g>
    </g>
  ),
  [SudokuVariant.Thermo]: (
    <g className="stroke-[4] fill-[gray]">
      <ellipse cx="90" cy="12" rx="3" ry="4" />
      <polyline points="90,12 70,12" />
      <ellipse cx="10" cy="88" rx="3" ry="4" />
      <polyline points="10,88 10,65" />
    </g>
  ),
  [SudokuVariant.Killer]: (
    <g>
      <polyline points="15,15 85,15 85,85 15,85 15,15" style={{ strokeDasharray: 3 }} />
      <text x="16" y="20" className="fill-digit-fixed stroke-none text-[4px]">45</text>
    </g>
  ),
  [SudokuVariant.Arrow]: (
    <g>
      <polyline points="53,36 53,25 60,19" />
      <polyline points="60,22 61,18 58,18.1" />
      <polyline points="54,63 54,72 48,78" />
      <polyline points="48,75 47.5,78.5 50,78.5" />
    </g>
  ),
  [SudokuVariant.Irregular]: (
    <polyline points="80,25 80,49 20,49 20,70" />
  ),
  [SudokuVariant.Kropki]: (
    <g>
      <line x1="13" y1="49" x2="87" y2="49" />
      <ellipse cx="50" cy="49" rx="1" ry="1.8" className="fill-[white] stroke-none" />
      <ellipse cx="45" cy="49" rx="1" ry="1.8" className="fill-[black] stroke-[white] stroke-[0.5]" />
      <ellipse cx="55" cy="49" rx="1" ry="1.8" className="fill-[black] stroke-[white] stroke-[0.5]" />
    </g>
  ),
  [SudokuVariant.TopBottom]: (
    <polyline points="75,0 75,15 62,30 62,45 53,53 53,70 40,85 40,100" className="opacity-60" />
  ),
  [SudokuVariant.Diagonal]: (
    <g className="opacity-60">
      <line x1="0" y1="0" x2="100" y2="100" />
      <line x1="100" y1="0" x2="0" y2="100" />
    </g>
  ),
  [SudokuVariant.Mixed]: (
    <g className="fill-thermo stroke-none">
      <text x="15" y="25" rotate={-15}>?</text>
      <text x="80" y="30" rotate={20}>?</text>
      <text x="60" y="90" rotate={15}>?</text>
    </g>
  ),
  [SudokuVariant.AntiKnight]: (
    <>
      <FontAwesomeIcon icon={faChessKnight} x="7" y="7" width="15" height="15" />
      <FontAwesomeIcon icon={faChessKnight} x="77" y="77" width="15" height="15" />
    </>
  ),
  [SudokuVariant.AntiKing]: (
    <>
      <FontAwesomeIcon icon={faChessKing} x="7" y="7" width="15" height="15" />
      <FontAwesomeIcon icon={faChessKing} x="77" y="77" width="15" height="15" />
    </>
  ),
  [SudokuVariant.ExtraRegions]: (
    <g className="fill-oddeven stroke-0">
      <rect x="7" y="30" width="33" height="18" />
      <rect x="42" y="30" width="51" height="18" />
    </g>
  ),
  [SudokuVariant.OddEven]: (
    <g className="fill-oddeven stroke-0">
      <ellipse cx="34" cy="39" rx="14" ry="12" />
      <rect x="50" y="30" width="30" height="18" />
    </g>
  ),
  [SudokuVariant.Renban]: (
    <g className="opacity-60">
      <polyline points="25,15 15,5 5,15 15,25" />
      <polyline points="75,15 85,5 95,15 85,25" />
      <polyline points="25,85 15,95 5,85 15,75" />
      <polyline points="75,85 85,95 95,85 85,75" />
    </g>
  ),
  [SudokuVariant.Palindrome]: null,
}

const SudokuVariantCard = ({ variant, difficulty }: { variant: SudokuVariant, difficulty: SudokuDifficulty }) => (
  <div className="w-full sm:w-[14rem] p-1.5">
    <Link to={`/play/${variant}/${difficulty}`}>
      <div className="relative h-48 border rounded border-secondary cursor-pointer text-3xl bg-tertiary text-primary hover:bg-softhighlight hover:text-secondary hover:shadow-sm hover:shadow-gray-700">
        <div className="w-full h-full flex flex-col items-center justify-center pb-2">
          <span className="z-20">{SudokuVariantDisplay[variant]}</span>
          <span className="z-20">Sudoku</span>
        </div>
        <svg
          className="absolute text-lg z-10 w-full h-full top-0 left-0 fill-none stroke-1 stroke-[gray]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {variantCardGraphics[variant]}
        </svg>
      </div>
    </Link>
  </div>
)

export default SudokuVariantCard
