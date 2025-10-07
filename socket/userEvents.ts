import { Socket, Server as SocketIOServer } from 'socket.io'
import User from '../modals/User.js'
import { generateToken } from '../utils/token.js'

export function registerUserEvents(io: SocketIOServer, socket: Socket) {
  socket.on('someUserEvent', (data) => {
    console.log('Received someUserEvent with data:', data)
    socket.emit('someUserEventResponse', { msg: 'Event received!' })
  })
  socket.on('updateProfile', async (data) => {
    console.log('Received update-profile with data:', data)
    const userId = socket.data.userId
    if (!userId) {
      socket.emit('update-profile', {
        success: false,
        msg: 'Unauthorized',
      })
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(userId, { name: data.name, avatar: data.avatar, bio: data.bio }, { new: true })

      if (!updatedUser) {
        return socket.emit('updateProfile', {
          success: false,
          msg: 'User not found',
        })
      }

      const newToken = generateToken(updatedUser)
      socket.emit('updateProfile', {
        success: true,
        msg: 'Profile updated successfully',
        data: { token: newToken },
      })

    } catch (error) {
      console.log('Error updating profile:', error)
      socket.emit('updateProfile', {
        success: false,
        msg: 'Internal server error',
      })
    }
  })
}
