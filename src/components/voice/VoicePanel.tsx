import { faCircleExclamation, faCircleInfo, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import { useCallback, useContext } from 'react'
import { useSelector } from 'src/hooks'
import { Popover, PopoverContent, PopoverHandler } from 'src/shared/Popover'
import { VoiceContext } from './VoiceProvider'
import LoadingSpinner from 'src/shared/LoadingSpinner'

const VoicePanel = () => {
  const voiceEnabled = useSelector(state => state.userData.settings?.voiceEnabled ?? false)
  const voiceListening = useSelector(state => state.misc.voiceListening)
  const voiceWords = useSelector(state => state.misc.voiceWords)
  const voiceWordsPreview = useSelector(state => state.misc.voiceWordsPreview)
  const paused = useSelector(state => state.puzzle.controls.paused)
  const { enabled, error, start, pause } = useContext(VoiceContext)

  const handleMicClick = useCallback(() => {
    if (paused) {
      return
    }
    if (voiceListening) {
      pause(true)
    } else {
      start(true)
    }
  }, [paused, voiceListening, start, pause])

  if (!voiceEnabled) {
    return null
  }

  return (
    <div className="flex gap-x-2 justify-between items-center w-full md:w-64 mt-2 md:mt-0 bg-secondary p-2 px-3">
      {error !== undefined ? (
        <>
          <FontAwesomeIcon icon={faCircleExclamation} />
          <span>{error}</span>
        </>
      ) : enabled ? (
        <>
          <div
            className="min-w-[20px] flex justify-center items-center cursor-pointer"
            onClick={handleMicClick}
            aria-disabled={paused}
          >
            {voiceListening ? (
              <FontAwesomeIcon icon={faMicrophone} color="deepskyblue" />
            ): (
              <FontAwesomeIcon icon={faMicrophoneSlash} />
            )}
          </div>
          <div className={classNames('grow flex justify-start items-center', {
            ['text-secondary']: voiceWordsPreview !== '',
          })}>
            {voiceWordsPreview ? `${voiceWordsPreview}...` : voiceWords}
          </div>
          <div>
            <Popover placement="bottom-start">
              <PopoverHandler>
                <FontAwesomeIcon icon={faCircleInfo} className="cursor-pointer" />
              </PopoverHandler>
              <PopoverContent className="bg-tertiary text-primary border-secondary">
                <div><b>Row one column three</b> - selects cell (1, 3)</div>
                <div><b>Cell one three</b> - selects cell (1, 3)</div>
                <div><b>Up</b>, <b>Down</b>, <b>Left</b> or <b>Right</b> - selects adjacent cell</div>
                <div><b>Put seven</b> or <b>Seven</b> - writes digit 7</div>
                <div><b>Delete</b> or <b>Remove</b> - clears selected cell</div>
                <div><b>Undo</b> - undoes last action</div>
                <div><b>Redo</b> - redoes last undone action</div>
                <div><b>Digit</b> or <b>Number</b> - changes to digit input mode</div>
                <div><b>Corner</b> or <b>Corner mark</b> - changes to corner input mode</div>
                <div><b>Center</b> or <b>Center mark</b> - changes to center input mode</div>
              </PopoverContent>
            </Popover>
          </div>
        </>
      ) : (
        <>
          <span><LoadingSpinner size="sm" /></span>
          <span>Loading...</span>
          <span className="flex items-center text-xs">(first time it's slow)</span>
        </>
      )}
    </div>
  )
}

export default VoicePanel
