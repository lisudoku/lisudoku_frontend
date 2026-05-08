import type { SolutionStep, SudokuConstraints } from 'lisudoku-solver';
import { StepRuleDisplay } from 'src/utils/constants';
import { HintLevel } from 'src/reducers/puzzle';
import { computeStepDescription } from 'src/utils/stepsLogic/stepsLogic';

export const StepDescription = (
  { step, hintLevel, constraints }: { step: SolutionStep, hintLevel: HintLevel, constraints: SudokuConstraints }
) => (
  <span>
    <b>
      {/* TODO: Need to find a way to make this an <ExternalLink /> without */}
      {/* user accidentally clicking on it */}
      <span className="text-primary font-bold">{StepRuleDisplay[step.rule]}</span>
    </b>
    {hintLevel !== HintLevel.Small && (
      <span>
        {' '}
        {computeStepDescription(step, constraints, hintLevel)}
      </span>
    )}
  </span>
)
