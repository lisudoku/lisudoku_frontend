import type { SolutionStep, SudokuConstraints } from 'lisudoku-solver';
import { StepRuleDisplay } from 'src/utils/constants';
import { HintLevel } from 'src/reducers/puzzle';
import { getBigStepExplanation } from 'src/utils/solver';

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
        {getBigStepExplanation(step, hintLevel, constraints)}
      </span>
    )}
  </span>
)
