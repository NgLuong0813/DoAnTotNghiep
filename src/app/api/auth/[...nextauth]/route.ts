import NextAuth from 'next-auth'
import { cauHinhXacThuc } from '@/lib/cauHinhXacThuc'

const handler = NextAuth(cauHinhXacThuc)
export { handler as GET, handler as POST }
