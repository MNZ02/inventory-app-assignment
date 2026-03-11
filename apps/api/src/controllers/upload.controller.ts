import { Context } from 'hono'
import { v2 as cloudinary } from 'cloudinary'

export const uploadController = {
  async sign(c: Context) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000)
      const folder = 'product-images'
      
      const apiSecret = process.env.CLOUDINARY_API_SECRET
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME
      const apiKey = process.env.CLOUDINARY_API_KEY
      
      if (!apiSecret || !cloudName || !apiKey) {
        console.error('Cloudinary environment variables are not fully configured')
        return c.json({ data: null, error: 'Internal server error' }, 500)
      }

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder,
        },
        apiSecret
      )

      return c.json({
        data: {
          timestamp,
          signature,
          cloudName,
          apiKey,
          folder,
        }
      })
    } catch (error) {
      console.error('Cloudinary sign error:', error)
      return c.json({ data: null, error: 'Failed to generate upload signature' }, 500)
    }
  }
}
