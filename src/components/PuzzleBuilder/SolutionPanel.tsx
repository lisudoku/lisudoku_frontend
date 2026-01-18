import { ReactNode } from 'react'

const CloseButton = ({ onClick }: { onClick?: () => void }) => (
  <div onClick={onClick} className="font-light text-xs cursor-pointer">Clear</div>
)

const SolutionPanel = ({ children, className, onClear }: SolutionPanelProps) => (
  <div className={`rounded text-primary min-h-10 bg-tertiary justify-between flex flex-col ${className ?? ''}`}>
    <div className="flex-1 overflow-y-auto pl-3 py-2">
      {children}
    </div>
    {onClear && (
      <div className="flex items-center justify-center bg-secondary/50 shrink-0 h-[30px]">
        <CloseButton onClick={onClear} />
      </div>
    )}
  </div>
)

type SolutionPanelProps = {
  children: ReactNode
  className?: string
  onClear?: () => void
}

export default SolutionPanel
