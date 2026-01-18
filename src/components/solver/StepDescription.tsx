import { SolutionStep } from 'lisudoku-solver';
import { StepRuleDisplay } from 'src/utils/constants';
import { HintLevel } from 'src/reducers/puzzle';
import { getBigStepExplanation } from 'src/utils/solver';
import ExternalLink from '../ExternalLink';

export const StepDescription = (
  { step, hintLevel, gridSize }: { step: SolutionStep, hintLevel: HintLevel, gridSize: number }
) => (
  <>
    <b>
      <ExternalLink url={`/learn#${step.rule}`}>
        {StepRuleDisplay[step.rule]}
      </ExternalLink>
    </b>
    {hintLevel !== HintLevel.Small && (
      <>
        {' '}
        {getBigStepExplanation(step, hintLevel, gridSize)}
      </>
    )}
  </>
)
