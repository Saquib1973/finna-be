import type { Document } from 'mongoose'

export interface UserProps extends Document {
  email: string
  password: string
  name?: string
  username?:string
  avatar?: string
  created?: Date
  otp?: string | undefined
  otp_expiry?: Date | undefined
}
