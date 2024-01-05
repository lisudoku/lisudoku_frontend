import { ReactElement } from 'react'
import Alert from '../Alert'

const CloseButton = ({ onClick }: { onClick?: () => void }) => (
  <div onClick={onClick} className="font-light text-xs cursor-pointer self-center">Clear</div>
)

const SolutionPanel = ({ children, className, onClear }: SolutionPanelProps) => (
  <Alert open
         className={`rounded py-2 ${className ?? ''}`}
         action={onClear && <CloseButton onClick={onClear} />}>
    {children}
  </Alert>
)

type SolutionPanelProps = {
  children: ReactElement | string
  className?: string
  onClear?: () => void
}

export default SolutionPanel
