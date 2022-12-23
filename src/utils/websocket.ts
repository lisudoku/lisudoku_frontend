import { createConsumer, Subscription } from '@rails/actioncable'
import { useCallback, useEffect, useRef, useState } from 'react'

const CABLE_URL = `${process.env.REACT_APP_API_BASE_URL}/cable`
const consumer = createConsumer(CABLE_URL)

export type WebsocketMessage = {
  type: any
  data: any
}

export const useWebsocket = (channelName: string, onMessage: Function | null, extraOptions: object = {}) => {
  const [ channel, setChannel ] = useState<Subscription>()
  const [ connected, setConnected ] = useState(false)
  const [ wsUserId, setWsUserId ] = useState<string>()

  const extraOptionsRef = useRef(extraOptions)

  useEffect(() => {
    const _channel = consumer.subscriptions.create({ ...extraOptionsRef.current, channel: channelName }, {
      received(message: WebsocketMessage) {
        console.log('[ws] Received', message)
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
        console.log('Channel initialized')
      },

      // Called when the subscription is ready for use on the server.
      connected() {
        console.log('Websocket connected')
        setConnected(true)
      },

      // Called when the Websocket connection is closed.
      disconnected() {
        console.log('Websocket disconnected')
      },

      // Called when the subscription is rejected by the server.
      rejected() {
        console.error('Connection rejected')
      },
    })

    setChannel(_channel)
    console.log('Created subscription')

    return () => {
      (consumer.subscriptions as any).remove(_channel)
      setChannel(undefined)
      console.log('Unsubscribing')
    }
  }, [channelName, onMessage])

  const sendMessage = useCallback((message: WebsocketMessage) => {
    if (!channel) {
      console.log("Didn't send message because channel not initialized")
      return
    }
    console.log('[ws] Sending', message)
    channel.send(message)
  }, [channel])

  return {
    ready: !!(connected && wsUserId),
    sendMessage,
  }
}
