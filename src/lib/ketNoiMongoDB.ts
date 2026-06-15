/**
 * LIB — Kết nối MongoDB Atlas
 * Dùng cache để tránh tạo nhiều kết nối khi Next.js hot-reload
 * Đường dẫn: src/lib/ketNoiMongoDB.ts
 */

import mongoose from 'mongoose'

const DUONG_DAN_DB = process.env.MONGODB_URI as string

if (!DUONG_DAN_DB) {
  throw new Error(
    '❌ Chưa cấu hình MONGODB_URI!\n' +
    'Vui lòng tạo file .env.local và thêm dòng:\n' +
    'MONGODB_URI=mongodb+srv://...'
  )
}

// Lưu cache kết nối vào global để tránh tạo lại khi hot-reload
const cacheToanCuc = global as any
if (!cacheToanCuc._cacheMongoDB) {
  cacheToanCuc._cacheMongoDB = { ketNoi: null, dangKetNoi: null }
}
const cache = cacheToanCuc._cacheMongoDB

async function ketNoiMongoDB() {
  // Đã có kết nối → dùng lại
  if (cache.ketNoi) return cache.ketNoi

  // Đang trong quá trình kết nối → chờ
  if (!cache.dangKetNoi) {
    cache.dangKetNoi = mongoose.connect(DUONG_DAN_DB, {
      bufferCommands: false,
      maxPoolSize:    10,    // Tối đa 10 kết nối đồng thời
      serverSelectionTimeoutMS: 5000,
    })
  }

  try {
    cache.ketNoi = await cache.dangKetNoi
    console.log('✅ Kết nối MongoDB Atlas thành công')
  } catch (loi) {
    cache.dangKetNoi = null  // Reset để thử lại lần sau
    throw loi
  }

  return cache.ketNoi
}

export default ketNoiMongoDB
