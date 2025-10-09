import mongoose from 'mongoose'
import type { ConversationProps } from '../types.js'

const conversationSchema = new mongoose.Schema<ConversationProps>({
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true,
  },
  name: String,
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  avatar: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

conversationSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model<ConversationProps>(
  'Conversation',
  conversationSchema
)
