import CredentialsProvider from 'next-auth/providers/credentials'
import ketNoiMongoDB from '@/lib/ketNoiMongoDB'
import NguoiDung from '@/models/NguoiDung'
import bcrypt from 'bcryptjs'
import type { AuthOptions } from 'next-auth'

export const cauHinhXacThuc: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "UTT Library",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Mat khau", type: "password" },
      },
      async authorize(thongTin) {
        if (!thongTin?.email || !thongTin?.password) return null
        await ketNoiMongoDB()
        const nguoiDung = await NguoiDung.findOne({ email: thongTin.email, hoatDong: true }).lean() as any
        if (!nguoiDung) return null
        const hopLe = await bcrypt.compare(thongTin.password, nguoiDung.matKhau)
        if (!hopLe) return null
        return {
          id: String(nguoiDung._id), email: nguoiDung.email,
          name: nguoiDung.hoTen, vaiTro: nguoiDung.vaiTro,
          soThe: nguoiDung.soThe, trangThaiThe: nguoiDung.trangThaiThe,
          anhDaiDien: nguoiDung.anhDaiDien,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.vaiTro = (user as any).vaiTro
        token.soThe = (user as any).soThe
        token.trangThaiThe = (user as any).trangThaiThe
        token.anhDaiDien = (user as any).anhDaiDien
      }
      if (trigger === "update" && session?.user?.anhDaiDien) {
        token.anhDaiDien = session.user.anhDaiDien
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).vaiTro = token.vaiTro
        ;(session.user as any).soThe = token.soThe
        ;(session.user as any).trangThaiThe = token.trangThaiThe
        ;(session.user as any).anhDaiDien = token.anhDaiDien
      }
      return session
    },
  },
  pages: { signIn: "/auth/dangnhap", error: "/auth/dangnhap" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
}
