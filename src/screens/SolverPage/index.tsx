import PageMeta from 'src/components/PageMeta'
import PuzzleBuilder from '../../components/PuzzleBuilder'

const SolverPage = () => (
  <>
    <PageMeta title="Sudoku Solver"
              url="https://lisudoku.xyz/solver"
              description="Build and run the solver on any puzzle.
                A tool that can be used by sudoku puzzle setters and solvers alike." />
    <PuzzleBuilder admin={false} />
  </>
)

export default SolverPage
