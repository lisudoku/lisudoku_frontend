import { useCallback, useEffect, useState } from 'react'
import { SudokuConstraints, SudokuLogicalSolveResult } from 'lisudoku-solver'
import { useDispatch, useSelector } from 'src/hooks'
import { changeLogicalSolutionStepIndex } from 'src/reducers/builder'
import { Slider } from 'src/design_system/Slider'
import { NavButton } from '../NavButton'
import { faBackwardStep, faForwardStep } from '@fortawesome/free-solid-svg-icons'
import { LogicalSolutionPanelContent } from './LogicalSolutionPanelContent'
import SolutionPanel from './SolutionPanel'

interface LogicalSolutionPanelProps {
  solution: SudokuLogicalSolveResult | null
  constraints: SudokuConstraints
  running: boolean
  setterMode: boolean
  onClear: () => void
}

export const LogicalSolutionPanel = ({ solution, constraints, running, setterMode, onClear }: LogicalSolutionPanelProps) => {
  const dispatch = useDispatch()
  const logicalSolutionStepIndex = useSelector(state => state.builder.logicalSolutionStepIndex)
  const [isStepsDirty, setIsStepsDirty] = useState(false)

  const handleStepChange = useCallback((stepIndex: number) => {
    dispatch(changeLogicalSolutionStepIndex(stepIndex))
    setIsStepsDirty(true)
  }, [dispatch])

  useEffect(() => {
    if (solution === null) {
      setIsStepsDirty(false)
    }
  }, [solution])

  return (
    <SolutionPanel className="max-h-96">
      <SolutionPanel.Body>
        <LogicalSolutionPanelContent
          solution={solution}
          constraints={constraints}
          running={running}
          setterMode={setterMode}
          onStepChange={handleStepChange}
          isDirty={isStepsDirty}
        />
      </SolutionPanel.Body>
      {solution !== null && (
        <>
          <SolutionPanel.Footer className="px-2">
            <Slider
              value={(logicalSolutionStepIndex ?? -1) + 1}
              max={solution.steps.length + 1}
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
                handleStepChange((logicalSolutionStepIndex ?? 0) - 1)
              }}
              disabled={(logicalSolutionStepIndex ?? -1) === -1}
            />
            <NavButton
              icon={faForwardStep}
              size="2x"
              onClick={() => {
                handleStepChange((logicalSolutionStepIndex ?? 0) + 1)
              }}
              disabled={logicalSolutionStepIndex === solution.steps.length}
            />
            <SolutionPanel.ClearButton
              onClick={onClear}
              className="!absolute right-5"
            />
          </SolutionPanel.Footer>
        </>
      )}
    </SolutionPanel>
  )
}
