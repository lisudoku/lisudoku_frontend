import classNames from 'classnames'
import { ReactNode } from 'react'

interface LogicalSolutionStepProps {
  stepIndex: number
  selected: boolean
  onClick: (index: number) => void
  children: ReactNode
}

export const LogicalSolutionStep = (
  { stepIndex, selected, onClick, children }: LogicalSolutionStepProps
) => (
  <li
    className={classNames('p-1 hover:bg-secondary/25 cursor-pointer', {
      '!bg-secondary': selected,
    })}
    onClick={() => onClick(stepIndex)}
  >
      <span>{stepIndex + 1}</span>
      .{' '}
      {children}
  </li>
)
