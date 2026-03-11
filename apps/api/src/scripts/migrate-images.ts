import { db } from '../db/index'
import { products } from '../db/schema'
import { like, eq } from 'drizzle-orm'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function runMigration() {
  const isDryRun = process.argv.includes('--dry-run')
  console.log(`Starting migration... Dry run: ${isDryRun}`)

  const rows = await db.select().from(products).where(like(products.imageUrl, 'data:image/%'))
  
  console.log(`Found ${rows.length} products with base64 images.`)

  if (isDryRun) {
    rows.forEach((r) => console.log(`- Product ID: ${r.id}, SKU: ${r.sku}`))
    process.exit(0)
  }

  for (const row of rows) {
    try {
      console.log(`Uploading image for product ${row.id}...`)
      // Cloudinary upload accepts base64 data URIs directly
      const result = await cloudinary.uploader.upload(row.imageUrl!, {
        folder: 'product-images',
      })
      
      console.log(`Updating product ${row.id} with new URL: ${result.secure_url}`)
      await db.update(products).set({ imageUrl: result.secure_url }).where(eq(products.id, row.id))
      console.log(`Successfully migrated product ${row.id}`)
    } catch (err) {
      console.error(`Failed to migrate product ${row.id}:`, err)
    }
  }

  console.log('Migration completed.')
  process.exit(0)
}

runMigration().catch((err) => {
  console.error('Fatal migration error:', err)
  process.exit(1)
})
