import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.route.js'
import { rateLimiter } from './services/rateLimiter.js'
import { initSocket } from './socket/socket.js'
dotenv.config()

const app = express()

app.set('trust proxy', 1) // trust first proxy if you are behind a proxy like nginx or cloudflare

app.use(rateLimiter.general)
app.use(express.json({limit:"10mb"}))
app.use(cors())

app.use('/auth', rateLimiter.auth, authRoutes)

app.get('/', (req, res) => {
  res.send('Server is running')
})
app.get('/test', (req, res) => {
  res.json({
    message: 'Test endpoint',
    ip: req.ip,
    timestamp: new Date().toISOString()
  })
})

const PORT = process.env.PORT || 3000

const server = http.createServer(app) // need this cause express app creates server internally and we dont have the reference to access it so we need to create a server explicitly

initSocket(server) // socket

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log('📍 INFO: Server running | PORT:', PORT)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err)
  })
