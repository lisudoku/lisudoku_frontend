import { useCallback, useEffect, useState } from 'react'
import type { SudokuConstraints } from 'lisudoku-solver'
import { useDispatch } from 'src/hooks'
import { changeLogicalSolutionStepIndex, LogicalSolverState } from 'src/reducers/builder'
import { Slider } from 'src/design_system/Slider'
import { NavButton } from '../NavButton'
import { faBackwardStep, faForwardStep } from '@fortawesome/free-solid-svg-icons'
import { LogicalSolutionPanelContent } from './LogicalSolutionPanelContent'
import SolutionPanel from './SolutionPanel'
import { SolutionPanelActionPanel } from './SolutionPanelActionPanel'

interface LogicalSolutionPanelProps {
  solverState: LogicalSolverState
  constraints: SudokuConstraints
  setterMode: boolean
  onRun: () => void
  onStop: () => void
  onClear: () => void
}

export const LogicalSolutionPanel = ({ solverState, constraints, setterMode, onRun, onStop, onClear }: LogicalSolutionPanelProps) => {
  const dispatch = useDispatch()
  const [isStepsDirty, setIsStepsDirty] = useState(false)

  const handleStepChange = useCallback((stepIndex: number) => {
    dispatch(changeLogicalSolutionStepIndex(stepIndex))
    setIsStepsDirty(true)
  }, [dispatch])

  useEffect(() => {
    if (solverState.solution === undefined) {
      setIsStepsDirty(false)
    }
  }, [solverState])

  return (
    <SolutionPanel className="max-h-96">
      <SolutionPanel.Header>
        <div>
          Logical Solver
        </div>
        <SolutionPanelActionPanel
          solverState={solverState}
          onRun={onRun}
          onClear={onClear}
          onStop={onStop}
        />
      </SolutionPanel.Header>
      <SolutionPanel.Body>
        <LogicalSolutionPanelContent
          solverState={solverState}
          constraints={constraints}
          setterMode={setterMode}
          onStepChange={handleStepChange}
          isDirty={isStepsDirty}
        />
      </SolutionPanel.Body>
      {solverState.solution !== undefined && (
        <>
          <SolutionPanel.Footer className="px-2">
            <Slider
              value={(solverState.solutionStepIndex ?? -1) + 1}
              max={solverState.solution.steps.length + 1}
              onChange={value => {
                handleStepChange(value - 1)
              }}
              className="!h-10"
              thumbClassName="top-2 size-8"
              trackClassName="!h-1.5"
            />
          </SolutionPanel.Footer>
          <SolutionPanel.Footer className="gap-3 pb-1">
            <NavButton
              icon={faBackwardStep}
              size="2x"
              onClick={() => {
                handleStepChange((solverState.solutionStepIndex ?? 0) - 1)
              }}
              disabled={(solverState.solutionStepIndex ?? -1) === -1}
            />
            <NavButton
              icon={faForwardStep}
              size="2x"
              onClick={() => {
                handleStepChange((solverState.solutionStepIndex ?? 0) + 1)
              }}
              disabled={solverState.solutionStepIndex === solverState.solution.steps.length}
            />
          </SolutionPanel.Footer>
        </>
      )}
    </SolutionPanel>
  )
}
