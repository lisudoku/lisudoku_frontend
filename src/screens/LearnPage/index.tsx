import _ from 'lodash'
import { useLocation } from 'react-router-dom'
import { Typography } from '@material-tailwind/react'
import TechniqueCard from './TechniqueCard'
import PageMeta from 'src/components/PageMeta'
import { TECHNIQUES_BY_DIFFICULTY } from './techniques'
import { Technique } from './types'
import { EStepRuleDifficulty } from 'src/utils/constants'

const LearnPage = () => {
  const { hash } = useLocation()

  return (
    <div className="px-3">
      <PageMeta title="Learn Sudoku Solving Techniques" url="https://lisudoku.xyz/learn" />
      <Typography variant="h3">
        <a href="/learn#">Solving techniques</a>
      </Typography>
      {_.map(TECHNIQUES_BY_DIFFICULTY, (techniques: Technique[], difficulty: EStepRuleDifficulty) => (
        <div key={difficulty} className="mt-4">
          <Typography variant="h4">
            {difficulty}
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
