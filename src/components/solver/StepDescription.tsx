import { SolutionStep } from 'lisudoku-solver';
import { StepRuleDisplay } from 'src/utils/constants';
import { HintLevel } from 'src/reducers/puzzle';
import { getBigStepExplanation } from 'src/utils/solver';

export const StepDescription = (
  { step, hintLevel, gridSize }: { step: SolutionStep, hintLevel: HintLevel, gridSize: number }
) => (
  <>
    <b>
      {/* TODO: Need to find a way to make this an <ExternalLink /> without */}
      {/* user accidentally clicking on it */}
      <span className="text-primary font-bold">{StepRuleDisplay[step.rule]}</span>
    </b>
    {hintLevel !== HintLevel.Small && (
      <>
        {' '}
        {getBigStepExplanation(step, hintLevel, gridSize)}
      </>
    )}
  </>
)
