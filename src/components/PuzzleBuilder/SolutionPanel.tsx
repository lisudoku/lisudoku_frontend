import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

const SolutionPanel = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={classNames('rounded text-primary min-h-10 bg-tertiary justify-between flex flex-col', className)}>
    {children}
  </div>
)

SolutionPanel.Body = ({ children }: PropsWithChildren) => (
  <div className="flex-1 overflow-y-auto pl-3 py-2">
    {children}
  </div>
)

SolutionPanel.Footer = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={classNames('flex items-center justify-center bg-secondary/50 shrink-0', className)}>
    {children}
  </div>
)

SolutionPanel.ClearButton = ({ onClick, className }: { onClick: () => void; className?: string }) => (
  <div
    onClick={onClick}
    className={classNames('font-light text-xs cursor-pointer', className)}
  >
    Clear
  </div>
)

export default SolutionPanel
