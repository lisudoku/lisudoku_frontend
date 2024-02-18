import { isNil } from 'lodash-es'
import { useSelector } from 'src/hooks'
import Alert from '../../shared/Alert'
import Typography from 'src/shared/Typography';
import { formatTimer } from 'src/utils/sudoku';

// https://leancrew.com/all-this/2020/06/ordinal-numerals-and-javascript/
function ordinal(n: number) {
  var s = ["th", "st", "nd", "rd"];
  var v = n%100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

const SolveStatsPanel = () => {
  const solveStats = useSelector(state => state.puzzle.solveStats)
  if (isNil(solveStats)) {
    return null
  }

  return (
    <Alert
      className="absolute h-full"
      open
    >
      <div className="h-full flex flex-col justify-evenly px-1">
        <Typography variant="paragraph" className="font-normal leading-normal">
          You are the <b>{ordinal(solveStats.count)}</b> person to solve this puzzle!
        </Typography>

        <Typography variant="paragraph">
          Puzzle median time: <b>{formatTimer(solveStats.median)}</b>
        </Typography>

        <Typography variant="paragraph">
          You're in the <b>{ordinal(solveStats.rank)}</b> percentile.
        </Typography>
      </div>
    </Alert>
  )
}

export default SolveStatsPanel
