import { orderBy } from 'lodash-es'
import PageMeta from 'src/components/PageMeta'
import SolvesTable from 'src/components/SolvesTable'
import { useSelector } from 'src/hooks'
import Typography from 'src/design_system/Typography'

const MySolvesPage = () => {
  const solvedPuzzles = useSelector(state => state.userData.solvedPuzzles)
  const sortedSolvedPuzzles = orderBy(solvedPuzzles, us => us.createdAt ?? '0', ['desc'])

  return (
    <div className="px-4 py-3">
      <PageMeta
        title="My Solves"
        url="https://lisudoku.xyz/mysolves"
        description="Replay your solved puzzles"
      />
      <Typography variant="h3">
        My Solves
      </Typography>
      <SolvesTable userSolutions={sortedSolvedPuzzles} />
    </div>
  )
}

export default MySolvesPage
