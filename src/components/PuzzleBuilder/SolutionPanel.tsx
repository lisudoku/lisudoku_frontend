import classNames from 'classnames'
import type { PropsWithChildren, ReactNode } from 'react'
import Button from 'src/design_system/Button'

const SolutionPanel = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={classNames('rounded text-primary bg-tertiary justify-between flex flex-col', className)}>
    {children}
  </div>
)

SolutionPanel.Header = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={classNames('flex items-center justify-between bg-secondary/50 shrink-0 px-3 py-1', className)}>
    {children}
  </div>
)

SolutionPanel.Body = ({ children }: PropsWithChildren) => (
  <div className="flex-1 overflow-y-auto pl-3 py-2 empty:p-0">
    {children}
  </div>
)

SolutionPanel.Footer = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={classNames('flex items-center justify-center bg-secondary/50 shrink-0', className)}>
    {children}
  </div>
)

interface PanelButtonProps {
  children: ReactNode
  onClick: () => void
  className?: string
  disabled?: boolean
  "aria-label"?: string
}

SolutionPanel.Button = ({ className, ...props }: PanelButtonProps) => (
  <Button
    variant="text"
    className={classNames('font-light text-xs cursor-pointer', className)}
    {...props}
  />
)

SolutionPanel.ClearButton = ({ className, ...props }: Omit<PanelButtonProps, 'children'>) => (
  <SolutionPanel.Button
    className={classNames('font-light text-xs cursor-pointer', className)}
    aria-label="Clear the solution found by the solver"
    {...props}
  >
    Clear
  </SolutionPanel.Button>
)

export default SolutionPanel
