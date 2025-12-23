import { map } from 'lodash-es'
import { useLocation } from 'react-router-dom'
import TechniqueCard from './TechniqueCard'
import Typography from 'src/design_system/Typography'
import PageMeta from 'src/components/PageMeta'
import { TECHNIQUES_BY_DIFFICULTY } from './techniques'
import { Technique } from './types'
import { EStepRuleDifficulty, StepRuleDifficultyDisplay } from 'src/utils/constants'

const LearnPage = () => {
  const { hash } = useLocation()

  return (
    <div className="px-3">
      <PageMeta title="Learn Sudoku Solving Techniques"
                url="https://lisudoku.xyz/learn"
                description="The list of solving techniques necessary and sufficient for solving our puzzles" />
      <Typography variant="h3">
        <a href="/learn#">Solving Techniques</a>
      </Typography>
      {map(TECHNIQUES_BY_DIFFICULTY, (techniques: Technique[], difficulty: EStepRuleDifficulty) => (
        <div key={difficulty} className="mt-4">
          <Typography variant="h4">
            {StepRuleDifficultyDisplay[difficulty]}
          </Typography>
          <div className="flex flex-wrap w-full">
            {techniques.map((technique: Technique) => (
              <TechniqueCard key={technique.id}
                            technique={technique}
                            selected={hash === `#${technique.id}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default LearnPage
