import { Socket, Server as SocketIOServer } from 'socket.io'
import Conversation from '../modals/Conversation.js'

export function registerChatEvents(io: SocketIOServer, socket: Socket) {
  socket.on('newConversation', async (data) => {
    console.log('New conversation event received:', data)

    try {
      if (data.type === 'direct') {
        const existingConversation = await Conversation.findOne({
          participants: {
            $all: data.participants,
            $size: 2,
          },
          type: 'direct',
        })
          .populate({
            path: 'participants',
            select: 'name username email avatar',
          })
          .lean()
        if (existingConversation) {
          socket.emit('newConversation', {
            success: true,
            data: { ...existingConversation, isNew: false },
          })
          return
        }
      }
      const conversation = await Conversation.create({
        type: data.type,
        participants: data.participants,
        name: data.name || '',
        avatar: data.avatar || '',
        createdBy: socket.data.userId,
      })

      const connectedSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => data.participants.includes(s.data.userId)
      )
      // join this conversation by all connected participants
      connectedSockets.forEach((s) => {
        s.join(conversation._id.toString())
      })

      const populatedConversation = await Conversation.findById(
        conversation._id
      )
        .populate({
          path: 'participants',
          select: 'name username email avatar',
        })
        .lean()

      if (!populatedConversation) {
        throw new Error('Failed to create conversation')
      }

      // Emit to the room for all participants
      io.emit(conversation._id.toString(), 'newConversation', {
        success: true,
        data: { ...populatedConversation, isNew: true },
      })

      // Also emit directly to the requesting socket for immediate response
      socket.emit('newConversation', {
        success: true,
        data: { ...populatedConversation, isNew: true },
      })
    } catch (error) {
      console.error('Error handling new conversation:', error)
      socket.emit('error', { msg: 'Failed to create conversation' })
    }
  })
}
