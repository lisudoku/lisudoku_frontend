import _ from 'lodash'
import { useEffect, useRef } from 'react'
import { Card, CardBody, Typography } from '@material-tailwind/react'
import ExternalLink from 'src/components/ExternalLink'
import { StepRuleDisplay } from 'src/utils/constants'
import { getPuzzleRelativeUrl, pluralize } from 'src/utils/misc'
import { Technique } from './types'

const TechniqueCard = ({ technique, selected }: TechniqueCardProps) => {
  const { id, akas, summary, externalResources, practicePuzzleIds } = technique
  const ref = useRef<null | HTMLDivElement>(null)

  useEffect(() => {
    if (selected && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selected])

  return (
    <div ref={ref} className="w-full lg:w-1/2 p-1 flex">
      <Card className="rounded bg-gray-600 text-white flex-grow">
        <CardBody>
          <Typography variant="h5">
            <a href={`#${id}`}>{StepRuleDisplay[id]}</a>
          </Typography>
          {akas && !_.isEmpty(akas) && (
            <Typography variant="paragraph">
              <b>Also known as</b>: {akas.join(', ')}.
            </Typography>
          )}
          <Typography variant="paragraph">
            <b>Summary</b>: {summary}
          </Typography>
          {externalResources && !_.isEmpty(externalResources) && (
            <Typography variant="paragraph">
              <b>Detailed explanations</b>: {' '}
              {externalResources.map((resource, index: number) => (
                <span key={index}>
                  <ExternalLink url={resource.url}>
                    {resource.name}
                  </ExternalLink>
                  {index + 1 < externalResources.length && ', '}
                </span>
              ))}
              .
            </Typography>
          )}
          {practicePuzzleIds && !_.isEmpty(practicePuzzleIds) && (
            <Typography variant="paragraph">
              <b>Practice {pluralize(practicePuzzleIds.length, 'puzzle')}</b>: {' '}
              {practicePuzzleIds.map((publicId, index) => (
                <span key={publicId}>
                  <ExternalLink url={getPuzzleRelativeUrl(publicId)}>
                    #{index + 1}
                  </ExternalLink>
                  {index + 1 < practicePuzzleIds.length && ', '}
                </span>
              ))}
              .
            </Typography>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

type TechniqueCardProps = {
  technique: Technique
  selected: boolean
}

export default TechniqueCard
