import { faCircleInfo, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react'
import { useSelector } from 'src/hooks'
import { Popover, PopoverContent, PopoverHandler } from 'src/shared/Popover'
import { VoiceContext } from './VoiceProvider'

const VoicePanel = () => {
  const voiceEnabled = useSelector(state => state.userData.settings?.voiceEnabled ?? false)
  const voiceListening = useSelector(state => state.misc.voiceListening)
  const voiceWords = useSelector(state => state.misc.voiceWords)
  const { enabled, start, pause } = useContext(VoiceContext)

  if (!voiceEnabled) {
    return null
  }

  return (
    <div className="flex gap-x-2 justify-between align-middle w-full md:w-64 mt-2 md:mt-0 bg-secondary p-2 px-3">
      {enabled ? (
        <>
          <div
            className="min-w-[20px] flex justify-center align-middle cursor-pointer"
            onClick={() => voiceListening ? pause() : start()}
          >
            <div>
              {voiceListening ? (
                <FontAwesomeIcon icon={faMicrophone} />
              ): (
                <FontAwesomeIcon icon={faMicrophoneSlash} />
              )}
            </div>
          </div>
          <div className="grow flex justify-start align-middle">
            {voiceWords}
          </div>
          <div>
            <Popover placement="bottom">
              <PopoverHandler>
                <FontAwesomeIcon icon={faCircleInfo} className="cursor-pointer" />
              </PopoverHandler>
              <PopoverContent className="bg-tertiary text-primary border-secondary">
                <div>Row one column three</div>
                <div>Up, Down, Left, Right</div>
                <div>Put seven</div>
              </PopoverContent>
            </Popover>
          </div>
        </>
      ) : (
        <>Loading... first time is slower</>
      )}
    </div>
  )
}

export default VoicePanel
