import PageMeta from 'src/components/PageMeta'
import PuzzleBuilder from '../../components/PuzzleBuilder'

const SolverPage = () => (
  <>
    <PageMeta title="lisudoku Solver" url="https://lisudoku.xyz/solver" />
    <PuzzleBuilder admin={false} />
  </>
)

export default SolverPage
