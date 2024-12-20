import { get } from 'lodash-es'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import type { Voice, VoiceHandlers } from './voice'
import { updateVoiceListening } from 'src/reducers/misc'

interface VoiceContextType {
  init: (handlers?: VoiceHandlers) => void
  start: (fullUpdate: boolean, handlers?: VoiceHandlers) => void
  pause: (fullUpdate: boolean) => void
  updateHandlers: (handlers?: VoiceHandlers) => void
  stop: () => void
  enabled: boolean
  error?: string
}

export const VoiceContext = createContext<VoiceContextType>({
  init: () => {},
  start: () => {},
  pause: () => {},
  updateHandlers: () => {},
  stop: () => {},
  enabled: false,
  error: undefined,
})

export const useVoice = (enabled: boolean, paused: boolean, handlers?: VoiceHandlers) => {
  const { init, updateHandlers, start, pause } = useContext(VoiceContext)

  useEffect(() => {
    if (enabled) {
      init(handlers)
      updateHandlers(handlers)
    }
  }, [enabled, updateHandlers, handlers])

  useEffect(() => {
    if (enabled) {
      if (paused) {
        pause(true)
      } else {
        start(true)
      }
    }

    return () => {
      pause(false)
    }
  }, [enabled, start, pause, paused])
}

export const VoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch()

  const [voice, setVoice] = useState<Voice>()
  const [error, setError] = useState<string>()
  const voiceInitializedRef = useRef<boolean>(false)

  const init = useCallback(async (handlers?: VoiceHandlers) => {
    if (voiceInitializedRef.current) {
      return false
    }
    voiceInitializedRef.current = true
    const { Voice } = await import('./voice')
    const voiceObj = new Voice(handlers)
    try {
      await voiceObj.init()
      setVoice(voiceObj)
    } catch (error: unknown) {
      if (get(error, 'name') === 'NotAllowedError') {
        setError('Please enable microphone permission')
      } else {
        throw error
      }
    }
    return true
  }, [])

  const start = useCallback(async (fullUpdate: boolean, handlers?: VoiceHandlers) => {
    if (voice === undefined) {
      const res = await init(handlers)
      if (!res) {
        return
      }
    } else {
      voice.start()
    }
    // Update on undefined because it means we just enabled it, so we want to listen
    if (voice !== undefined && !fullUpdate) {
      return
    }
    dispatch(updateVoiceListening(true))
  }, [voice, dispatch])

  const pause = useCallback((fullUpdate: boolean) => {
    voice?.pause()
    if (!fullUpdate) {
      return
    }
    dispatch(updateVoiceListening(false))
  }, [voice, dispatch])

  const updateHandlers = useCallback((handlers?: VoiceHandlers) => {
    voice?.setHandlers(handlers)
  }, [voice])

  const stop = useCallback(() => {
    voice?.close()
    setVoice(undefined)
    voiceInitializedRef.current = false
  }, [voice])

  return <VoiceContext.Provider value={{
    init,
    start,
    pause,
    updateHandlers,
    stop,
    enabled: Boolean(voice),
    error,
  }}>
    {children}
  </VoiceContext.Provider>
}
