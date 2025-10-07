import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.route.js'
import http from 'http'
import { initSocket } from './socket/socket.js'
dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

app.use('/auth', authRoutes)

app.get('/', (req, res) => {
  res.send('Server is running')
})

const PORT = process.env.PORT || 3000

const server = http.createServer(app) // need this cause express app creates server internally and we dont have the reference to access it so we need to create a server explicitly

initSocket(server) // socket

connectDB()
  .then(() => {
    console.log('📍 INFO: DB connected')
    server.listen(PORT, () => {
      console.log('📍 INFO: Server running | PORT:',PORT)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err)
  })
