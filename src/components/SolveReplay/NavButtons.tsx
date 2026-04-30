import {
  faBackwardFast, faBackwardStep, faForwardFast, faForwardStep, faPauseCircle, faPlayCircle,
} from '@fortawesome/free-solid-svg-icons'
import { NavButton } from '../NavButton'
import { HistoryStep } from './useGridHistory'

interface NavButtonsProps {
  history: HistoryStep[]
  currentStepIndex: number
  isPlaying: boolean
  onCurrentStepIndexChange: (step: number | ((s: number) => number)) => void
  onIsPlayingChange: (isPlaying: boolean) => void
}

const NavButtons = (
  { history, currentStepIndex, isPlaying, onCurrentStepIndexChange, onIsPlayingChange }: NavButtonsProps
) => (
  <div className="flex gap-3 md:gap-8 w-full justify-center">
    <NavButton
      icon={faBackwardFast}
      size="3x"
      onClick={() => {
        onCurrentStepIndexChange(0)
        onIsPlayingChange(false)
      }}
      disabled={currentStepIndex === 0}
    />
    <NavButton
      icon={faBackwardStep}
      size="3x"
      onClick={() => {
        onCurrentStepIndexChange(x => x - 1)
        onIsPlayingChange(false)
      }}
      disabled={currentStepIndex === 0}
    />
    {!isPlaying && (
      <NavButton
        size="3x"
        icon={faPlayCircle}
        onClick={() => onIsPlayingChange(true)}
        disabled={currentStepIndex === history.length - 1}
      />
    )}
    {isPlaying && (
      <NavButton
        icon={faPauseCircle}
        size="3x"
        onClick={() => onIsPlayingChange(false)}
        disabled={false}
      />
    )}
    <NavButton
      icon={faForwardStep}
      size="3x"
      onClick={() => {
        onCurrentStepIndexChange(x => x + 1)
        onIsPlayingChange(false)
      }}
      disabled={currentStepIndex === history.length - 1}
    />
    <NavButton
      icon={faForwardFast}
      size="3x"
      onClick={() => {
        onCurrentStepIndexChange(history.length - 1)
        onIsPlayingChange(false)
      }}
      disabled={currentStepIndex === history.length - 1}
    />
  </div>
)

export default NavButtons
