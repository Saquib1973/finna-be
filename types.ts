import type { Document, Types } from 'mongoose'

export interface UserProps extends Document {
  email: string
  password: string
  name?: string
  username?: string
  bio?:string
  avatar?: string
  created?: Date
  otp?: string | undefined
  otp_expiry?: Date | undefined
}

export interface ConversationProps extends Document {
  _id: string,
  type: "direct" | "group",
  name?: string,
  participants: Types.ObjectId[],
  lastMessage?: Types.ObjectId,
  avatar?: string,
  createdAt?: Date,
  updatedAt?: Date,
}