import { PageMeta } from 'src/components/PageMeta'
import PuzzleBuilder from '../../components/PuzzleBuilder'

const SolverPage = () => (
  <>
    <PageMeta
      title="Sudoku Variant Solver"
      url="https://lisudoku.xyz/solver"
      description="Free online sudoku variant solver for Classic, Thermo, Arrow, Kropki,
        Renban, and more. Build or import a puzzle and run the solver to get logical solving steps."
    />
    <PuzzleBuilder admin={false} />
  </>
)

export default SolverPage
