import crypto from 'crypto'

export const keyGenerator = async() => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = ''
  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    key += charset[randomIndex]
  }
  return key
}

export const generateSecretKey = async(id: string) => {
  const date = new Date
  const salt = id + date.getTime().toString()

  const hash = crypto.createHash('sha256')
  hash.update(salt)

  const key = hash.digest('hex')

  return key
}