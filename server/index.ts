import cors from 'cors'
import next from 'next'
import Pusher from 'pusher'
import express from 'express'
import bodyParser from 'body-parser'
require('dotenv').config()

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

const app = next({ dev })
const handler = app.getRequestHandler()

// Ensure that your pusher credentials are properly set in the .env file
// Using the specified variables
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.PUSHER_APP_KEY as string,
  secret: process.env.PUSHER_APP_SECRET as string,
  cluster: process.env.PUSHER_APP_CLUSTER as string,
  encrypted: true
})

interface Chat {
  user: any
  message: any
  timestamp: any
}

app
  .prepare()
  .then(() => {
    const server = express()

    server.use(cors())
    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({ extended: true }))

    server.get('*', (req: any, res: any) => {
      return handler(req, res)
    })

    const chatHistory: { messages: Chat[] } = { messages: [] }

    server.post('/message', (req: { body: { user?: any; message?: ''; timestamp?: number } }, res) => {
      const { user, message = '', timestamp = +new Date() } = req.body

      const chat = { user, message, timestamp }

      chatHistory.messages.push(chat)
      pusher.trigger('chat-room', 'new-message', { chat })
      res.sendStatus(200)
    })

    server.post('/messages', (_req, res) => {
      res.json({ ...chatHistory, status: 'success' })
    })

    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
  .catch((ex: { stack: any }) => {
    console.error(ex.stack)
    process.exit(1)
  })
