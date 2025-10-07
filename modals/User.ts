import { Schema, model } from 'mongoose'
import type { UserProps } from '../types.js'

const UserSchema = new Schema<UserProps>({
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
    required: true,
  },
  username: {
    type: String,
    unique: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  otp: { type: String },
  otp_expiry: { type: Date },
  created: {
    type: Date,
    default: Date.now(),
  },
})

export default model<UserProps>('User', UserSchema)
