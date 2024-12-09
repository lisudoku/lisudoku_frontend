import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import type { Voice, VoiceHandlers } from './voice'
import { updateVoiceListening } from 'src/reducers/misc'

interface VoiceContextType {
  start: (handlers?: VoiceHandlers) => void
  pause: () => void
  stop: () => void
  enabled: boolean
}

export const VoiceContext = createContext<VoiceContextType>({
  start: () => {},
  pause: () => {},
  stop: () => {},
  enabled: false,
})

export const useVoice = (enabled: boolean, handlers?: VoiceHandlers) => {
  const { start, pause } = useContext(VoiceContext)
  useEffect(() => {
    if (enabled) {
      start(handlers)
    }
    return () => {
      pause()
    }
  }, [enabled, start, handlers, pause])
}

export const VoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch()

  // TODO: define separate types?! might not make it lazy (maybe import type fixes it)
  const [voice, setVoice] = useState<Voice>()
  const voiceStartedRef = useRef<boolean>(false)

  const start = useCallback(async (handlers?: VoiceHandlers) => {
    if (voice === undefined) {
      if (voiceStartedRef.current) {
        return
      }
      voiceStartedRef.current = true
      import('./voice').then(async ({ Voice }) => {
        const voiceObj = new Voice(handlers)
        await voiceObj.init()
        setVoice(voiceObj)
      })
    } else {
      voice.start()
    }
    dispatch(updateVoiceListening(true))
  }, [voice, dispatch])

  const pause = useCallback(() => {
    voice?.pause()
    dispatch(updateVoiceListening(false))
  }, [voice, dispatch])

  const stop = useCallback(() => {
    voice?.close()
    setVoice(undefined)
    voiceStartedRef.current = false
  }, [voice])

  return <VoiceContext.Provider value={{
    start,
    pause,
    stop,
    enabled: Boolean(voice),
  }}>
    {children}
  </VoiceContext.Provider>
}
