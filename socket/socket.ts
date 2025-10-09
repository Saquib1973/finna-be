import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Socket, Server as SocketIOServer } from 'socket.io'
import { registerUserEvents } from './userEvents.js'
import { registerChatEvents } from './chatEvents.js'
import Conversation from '../modals/Conversation.js'
dotenv.config()

export function initSocket(server: any): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
    },
  }) // socket io server instance

  //auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error('Authentication error'))
        }

        let userData = decoded.user
        socket.data = userData
        socket.data.userId = userData.id
        next()
      }
    )
  })

  // Move this OUTSIDE the middleware
  io.on('connection', async (socket: Socket) => {
    const userId = socket.data.userId
    console.log(
      `User connected: ${userId}, username: ${socket.data.username}`
    )

    //register events
    registerUserEvents(io, socket)
    registerChatEvents(io, socket)

    //join all conversations of user
    try {
      const conversations = await Conversation.find({
        participants: userId,
      })
      conversations.forEach((conversation) => {
        socket.join(conversation._id.toString())
      })
    } catch (error) {
      console.error('Error joining conversations:', error)
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`)
    })
  })

  return io
}
