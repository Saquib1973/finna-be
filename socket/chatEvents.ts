import { Socket, Server as SocketIOServer } from 'socket.io'
import Conversation from '../modals/Conversation.js'
import Message from '../modals/Message.js'

export function registerChatEvents(io: SocketIOServer, socket: Socket) {

  socket.on("getConversations", async () => {
    try {
      
      const userId = socket.data.userId
      if (!userId) {
        socket.emit("getConversations", { success: false, msg: 'User not authenticated' })  
        return
      }

      const conversations = await Conversation.find({
        participants: userId,
      })
      .sort({ updatedAt: -1 })
        .populate({
          path: 'participants',
          select: 'name username email avatar',
        }).
        populate({
          path: 'lastMessage',
          populate: {
            path: 'senderId',
            select: 'name avatar',
          }
        })
        .lean()
      socket.emit("getConversations", { success: true, data: conversations })
    } catch (error) {
    console.error('Error fetching conversations:', error)
    socket.emit("getConversations", { success: false, msg: 'Failed to fetch conversations' })  
    }
  })
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
      io.to(conversation._id.toString()).emit('newConversation', {
        success: true,
        data: { ...populatedConversation, isNew: true },
      })

      // Also emit directly to the requesting socket for immediate response
      // socket.emit('newConversation', {
      //   success: true,
      //   data: { ...populatedConversation, isNew: true },
      // })
    } catch (error) {
      console.error('Error handling new conversation:', error)
      socket.emit('error', { msg: 'Failed to create conversation' })
    }
  })

  socket.on("newMessage", async (data) => {
    console.log('New message event received:', data)
    try {
      const message = await Message.create({
        conversationId:data.conversationId,
        senderId:data.sender.id,
        content:data.content,
        attachment:data.attachment,
      })
      io.to(data.conversationId).emit("newMessage", { success: true, data: {
        id:message._id,
        content:message.content,
        sender:{
          id:data.sender.id,
          name:data.sender.name,
          avatar:data.sender.avatar,
        },
        attachment:message.attachment,
        createdAt:new Date().toISOString(),
        conversationId:data.conversationId,
      } })
      await Conversation.findByIdAndUpdate(data.conversationId, {lastMessage:message._id})

    } catch (error) {
      console.error('Error handling new message:', error)
      socket.emit("newMessage", { success: false, msg: 'Failed to send message' })
    }
  })
  socket.on("getMessages", async (data:{conversationId:string}) => {
    console.log('New message event received:', data)
    try {
      const messages = await Message.find({conversationId:data.conversationId})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate<{senderId:{_id:string,name:string,avatar:string}}>({
        path: 'senderId',
        select: 'name avatar',
      }).lean()
      const messageWithSender = messages.map(msg=>({
        id:msg._id,
        content:msg.content,
        sender:{
          id:msg.senderId?._id,
          name:msg.senderId.name,
          avatar:msg.senderId.avatar,
        },
        attachment:msg.attachment,
        createdAt:msg.createdAt,
        conversationId:msg.conversationId,
      }))
      socket.emit("getMessages", { success: true, data: messageWithSender })
    } catch (error) {
      console.error('Error handling new message:', error)
      socket.emit("getMessages", { success: false, msg: 'Failed to send message' })
    }
  })
}
