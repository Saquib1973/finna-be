import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string)

    console.log('📍 INFO: MongoDB connected with connection pooling')

    // 🔥 Log connection events
    mongoose.connection.on('connected', () => {
      console.log('📍 Mongoose connected to MongoDB')
    })

    mongoose.connection.on('error', (err) => {
      console.error('📍 Mongoose connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('📍 Mongoose disconnected')
    })
  } catch (error) {
    console.log('MongoDB connection error: ', error)
    throw error
  }
}

export default connectDB
