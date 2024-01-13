import { CardProps, Card as MuiCard } from '@material-tailwind/react'
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

export default Card
