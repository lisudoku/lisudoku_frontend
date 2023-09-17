import { ReactElement } from 'react'
import Alert from '../Alert'

const CloseButton = () => (
  <div className="font-light text-xs">Clear</div>
)

const SolutionPanel = ({ children, className, onClear }: SolutionPanelProps) => (
  <Alert open
         className={`rounded py-2 ${className ?? ''}`}
         onClose={onClear}
         action={<CloseButton />}>
    {children}
  </Alert>
)

type SolutionPanelProps = {
  children: ReactElement | string
  className?: string
  onClear?: () => void
}

export default SolutionPanel
