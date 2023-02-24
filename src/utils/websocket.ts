import { createConsumer, Subscription } from '@rails/actioncable'
import { useCallback, useEffect, useRef, useState } from 'react'

const CABLE_URL = `${process.env.REACT_APP_API_BASE_URL}/cable`
const consumer = createConsumer(CABLE_URL)

export type WebsocketMessage = {
  type: any
  data: any
}

export const useWebsocket = (channelName: string, onMessage: Function | null, extraOptions: object = {}, isExternal = false) => {
  const [ channel, setChannel ] = useState<Subscription>()
  const [ connected, setConnected ] = useState(false)
  const [ wsUserId, setWsUserId ] = useState<string>()
  const [ error, setError ] = useState(false)

  const extraOptionsRef = useRef(extraOptions)

  useEffect(() => {
    if (isExternal) {
      // Don't show external puzzles on TV
      return
    }

    const _channel = consumer.subscriptions.create({ ...extraOptionsRef.current, channel: channelName }, {
      received(message: WebsocketMessage) {
        console.info('[ws] Received', message)
        switch (message.type) {
          case '__init__':
            setWsUserId(message.data!)
            break
          default:
            onMessage?.(message)
            break
        }
      },

      initialized() {
        console.info('[ws] Channel initialized')
      },

      // Called when the subscription is ready for use on the server.
      connected() {
        console.info('[ws] Websocket connected')
        setConnected(true)
      },

      // Called when the Websocket connection is closed.
      disconnected() {
        console.info('[ws] Websocket disconnected')
      },

      // Called when the subscription is rejected by the server.
      rejected() {
        console.error('[ws] Connection rejected')
        setError(true)
      },
    })

    setChannel(_channel)
    console.info('[ws] Created subscription')

    return () => {
      (consumer.subscriptions as any).remove(_channel)
      setChannel(undefined)
      console.info('[ws] Unsubscribing')
    }
  }, [channelName, onMessage, isExternal])

  const sendMessage = useCallback((message: WebsocketMessage) => {
    if (!channel) {
      console.warn("[ws] Didn't send message because channel not initialized")
      return
    }
    console.info('[ws] Sending', message)
    channel.send(message)
  }, [channel])

  return {
    ready: !!(connected && wsUserId),
    sendMessage,
    error,
  }
}
