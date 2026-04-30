import classNames from 'classnames'
import { forwardRef, type ReactNode } from 'react'

interface LogicalSolutionStepProps {
  stepIndex: number
  selected: boolean
  onClick: (index: number) => void
  children: ReactNode
}

export const LogicalSolutionStep = forwardRef<HTMLLIElement, LogicalSolutionStepProps>((
  { stepIndex, selected, onClick, children },
  ref
) => (
  <li
    className={classNames('p-1 hover:bg-secondary/25 cursor-pointer', {
      '!bg-secondary': selected,
    })}
    onClick={() => onClick(stepIndex)}
    ref={ref}
  >
      <span>{stepIndex + 1}</span>
      .{' '}
      {children}
  </li>
))
