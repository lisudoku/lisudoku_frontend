import { useEffect, useState } from 'react'
import { UserSolution } from 'src/types'
import SudokuGrid from '../Puzzle/SudokuGrid'
import { useCellSize } from 'src/utils/misc'
import { useGridHistory } from './useGridHistory'
import SolveSlider from './SolveSlider'
import NavButtons from './NavButtons'
import SolveStats from './SolveStats'
import { SudokuConstraints } from 'lisudoku-solver'

interface SolveReplayProps {
  userSolution: UserSolution
  constraints: SudokuConstraints
}

const SolveReplay = ({ userSolution, constraints }: SolveReplayProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const gridSize = constraints.gridSize
  const history = useGridHistory(gridSize, userSolution.steps ?? [])
  const historyStep = history[currentStepIndex]

  useEffect(() => {
    if (!isPlaying) {
      return
    }
    if (currentStepIndex === history.length - 1) {
      setIsPlaying(false)
      return
    }

    // TODO: optional real-time
    const diff = Math.min(7, history[currentStepIndex + 1].time - history[currentStepIndex].time)
    const timer = setTimeout(() => {
      setCurrentStepIndex(x => x + 1)
    }, diff * 1000)
    return () => {
      clearTimeout(timer)
    }
  }, [isPlaying, currentStepIndex, history])

  const cellSize = useCellSize(gridSize, 1.0, 32, 180)

  return (
    <div>
      <div className="flex gap-x-10 flex-wrap">
        <SudokuGrid
          constraints={constraints}
          cellSize={cellSize}
          {...historyStep}
        />
        {userSolution.solveTime !== undefined && userSolution.steps !== undefined && (
          <SolveStats
            userSolution={userSolution}
            currentStepIndex={currentStepIndex}
            historyStep={historyStep}
          />
        )}
      </div>
      <div className="mt-2">
        <SolveSlider
          value={currentStepIndex}
          onChange={value => {
            setCurrentStepIndex(value)
            setIsPlaying(false)
          }}
          history={history}
        />
      </div>
      <NavButtons
        history={history}
        currentStepIndex={currentStepIndex}
        isPlaying={isPlaying}
        onCurrentStepIndexChange={setCurrentStepIndex}
        onIsPlayingChange={setIsPlaying}
      />
    </div>
  )
}

export default SolveReplay
