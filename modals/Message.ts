import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  conversaionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: String,
  attachement:String,
}, { timestamps: true })

export default mongoose.model('Message', messageSchema)