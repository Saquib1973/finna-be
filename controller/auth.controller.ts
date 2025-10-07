import bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import User from '../modals/User.js'
import { generateToken } from '../utils/token.js'
import { z } from 'zod'
const AuthController = {
  //register controller
  register: async (req: Request, res: Response): Promise<void> => {
    const { email, password, name, avatar } = req.body
    try {
      //check if user already exists
      let user = await User.findOne({ email })
      if (user) {
        res.status(400).json({ success: false, msg: 'User already exists' })
        return
      }

      //create a new user
      user = new User({
        email,
        password,
        name,
        avatar: avatar || '',
      })

      //hash password
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)

      //save user
      await user.save()

      //generate jwt token
      const token = generateToken(user)

      res.json({
        success: true,
        token,
        msg: 'User created successfully',
      })
    } catch (error) {
      console.log('error: ', error)
      res.status(500).json({ success: false, msg: 'Server error' })
    }
  },

  //login controller
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    try {
      let user
      const checkEmail = z.string().email().safeParse(email)

      //find user by email or username
      user = checkEmail.success
        ? await User.findOne({ email })
        : await User.findOne({ username: email })

      if (!user) {
        console.log(user);
        res.status(400).json({ success: false, msg: 'Invalid credentials' })
        return
      }

      //verify password
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        res.status(400).json({ success: false, msg: 'Invalid credentials' })
        return
      }

      //generate token
      const token = generateToken(user)

      res.json({
        success: true,
        token,
        msg: 'User logged in successfully',
      })
    } catch (error) {
      console.log('error: ', error)
      res.status(500).json({ success: false, msg: 'Server error' })
    }
  },
}

export default AuthController
