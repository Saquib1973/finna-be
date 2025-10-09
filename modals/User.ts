import { Schema, model } from 'mongoose'
import type { UserProps } from '../types.js'

const userSchema = new Schema<UserProps>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
  },
  bio: {
    type:String,
  },
  avatar: {
    type: String,
    default: '',
  },
  otp: { type: String,sparse: true },
  otp_expiry: { type: Date,sparse: true },
  created: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

userSchema.index({ email: 1, created: -1 });
userSchema.index({ name: 'text', username: 'text',bio:"text",email:"text" })

export default model<UserProps>('User', userSchema)
