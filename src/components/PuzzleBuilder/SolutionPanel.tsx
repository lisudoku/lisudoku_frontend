import { ReactElement } from 'react'
import Alert from '../Alert'

const CloseButton = () => (
  <div className="font-light text-xs">Clear</div>
)

const SolutionPanel = ({ children, className, onClear }: SolutionPanelProps) => (
  <Alert show
         className={`rounded py-2 ${className ?? ''}`}
         onClose={onClear}
         closeButton={<CloseButton />}>
    {children}
  </Alert>
)

type SolutionPanelProps = {
  children: ReactElement | string
  className?: string
  onClear?: Function
}

export default SolutionPanel
