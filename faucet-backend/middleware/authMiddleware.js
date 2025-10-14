import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'No token provided' })

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    return res.status(403).json({ error: 'Invalid token' })
  }
}
