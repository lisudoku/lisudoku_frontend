import {
  faBackwardFast, faBackwardStep, faForwardFast, faForwardStep, faPauseCircle, faPlayCircle,
} from '@fortawesome/free-solid-svg-icons'
import NavButton from './NavButton'
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
  <div className="flex gap-8 w-full justify-center">
    <NavButton
      icon={faBackwardFast}
      onClick={() => {
        onCurrentStepIndexChange(0)
        onIsPlayingChange(false)
      }}
      disabled={currentStepIndex === 0}
    />
    <NavButton
      icon={faBackwardStep}
      onClick={() => {
        onCurrentStepIndexChange(x => x - 1)
        onIsPlayingChange(false)
      }}
      disabled={currentStepIndex === 0}
    />
    {!isPlaying && (
      <NavButton
        icon={faPlayCircle}
        onClick={() => onIsPlayingChange(true)}
        disabled={currentStepIndex === history.length - 1}
      />
    )}
    {isPlaying && (
      <NavButton
        icon={faPauseCircle}
        onClick={() => onIsPlayingChange(false)}
        disabled={false}
      />
    )}
    <NavButton
      icon={faForwardStep}
      onClick={() => {
        onCurrentStepIndexChange(x => x + 1)
        onIsPlayingChange(false)
      }}
      disabled={currentStepIndex === history.length - 1}
    />
    <NavButton
      icon={faForwardFast}
      onClick={() => {
        onCurrentStepIndexChange(history.length - 1)
        onIsPlayingChange(false)
      }}
      disabled={currentStepIndex === history.length - 1}
    />
  </div>
)

export default NavButtons
