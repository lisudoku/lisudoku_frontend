import { CardProps, Card as MuiCard, CardBody as MuiCardBody } from '@material-tailwind/react/components/Card'
import classNames from 'classnames'
import { forwardRef } from 'react'

const EXTRA_CLASSNAME = 'rounded bg-secondary text-primary'

const Card = forwardRef((props: CardProps, ref: React.ForwardedRef<HTMLDivElement>) => (
  <MuiCard
    {...props}
    ref={ref}
    className={classNames(EXTRA_CLASSNAME, props.className)}
  >
    {props.children}
  </MuiCard>
))

const CardBody = MuiCardBody

export { Card, CardBody }
