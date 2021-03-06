import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'
import Pusher from 'pusher-js'

import ChatMessage from './ChatMessage'

const Chat = ({ activeUser }: { activeUser: string | null }): JSX.Element => {
  const [chats, setChats] = useState<any[]>([])
  const pusher = new Pusher(process.env.PUSHER_APP_KEY as string, {
    cluster: process.env.PUSHER_APP_CLUSTER
  })
  const channel = pusher.subscribe('chat-room')

  useEffect(() => {
    channel.bind('new-message', ({ chat = null }) => {
      chat && updateChats(chat)
    })

    pusher.connection.bind('connected', () => {
      axios.post('/messages').then((response) => {
        const chats = response.data.messages
        setChats(chats)
      })
    })
    return () => {
      pusher.disconnect()
    }
  }, [])

  const updateChats = (chat: any) => setChats((prevChats) => [...prevChats, chat])

  const handleKeyUp = (evt: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const value = evt.currentTarget.value

    if (evt.key === 'Enter' && !evt.shiftKey) {
      const chat = { user: activeUser, message: value, timestamp: +new Date() }

      evt.currentTarget.value = ''
      axios.post('/message', chat)
    }
  }

  if (activeUser) {
    return (
      <Fragment>
        <div className='border-bottom border-gray w-100 d-flex align-items-center bg-white' style={{ height: 90 }}>
          <h2 className='text-dark mb-0 mx-4 px-2'>{activeUser}</h2>
        </div>
        <div
          className='px-4 pb-4 w-100 d-flex flex-row flex-wrap align-items-start align-content-start position-relative'
          style={{ height: 'calc(100% - 180px)', overflowY: 'scroll' }}
        >
          {chats.map((chat, index) => {
            const previous = Math.max(0, index - 1)
            const previousChat = chats[previous]
            const position = chat.user === activeUser ? 'right' : 'left'

            const isFirst = previous === index
            const inSequence = chat.user === previousChat.user
            const hasDelay = Math.ceil((chat.timestamp - previousChat.timestamp) / (1000 * 60)) > 1

            return (
              <Fragment key={index}>
                {(isFirst || !inSequence || hasDelay) && (
                  <div
                    className={`d-block w-100 font-weight-bold text-dark mt-4 pb-1 px-1 text-${position}`}
                    style={{ fontSize: '0.9rem' }}
                  >
                    <span>{chat.user || 'Anonymous'}</span>
                  </div>
                )}

                <ChatMessage message={chat.message} position={position} />
              </Fragment>
            )
          })}
        </div>
        <div className='border-top border-gray w-100 px-4 d-flex align-items-center bg-light' style={{ minHeight: 90 }}>
          <textarea
            className='form-control px-3 py-2'
            onKeyUp={handleKeyUp}
            placeholder='Enter a chat message'
            style={{ resize: 'none' }}
          />
        </div>
      </Fragment>
    )
  }
  return <Fragment />
}

export default Chat
