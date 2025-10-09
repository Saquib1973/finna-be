import rateLimit from 'express-rate-limit'

const TIME_FOR_GENERAL_REQUESTS = 15 * 60 * 1000 // 15 minutes
const MAX_GENERAL_REQUESTS = 100
const TIME_FOR_AUTH_REQUESTS = 15 * 60 * 1000 // 15 minutes
const MAX_AUTH_REQUESTS = 5
export const rateLimiter = {
  general: rateLimit({
    windowMs: TIME_FOR_GENERAL_REQUESTS,
    max: MAX_GENERAL_REQUESTS,
    message: {
      error:
        'Too many requests from this IP, please try again after 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
  auth: rateLimit({
    windowMs: TIME_FOR_AUTH_REQUESTS,
    max: MAX_AUTH_REQUESTS,
    message: {
      error: 'Too many requests from this IP, please try again after later',
    },
    skipSuccessfulRequests: true,
  }),
}
