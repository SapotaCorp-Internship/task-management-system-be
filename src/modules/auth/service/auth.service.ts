import prisma from "@/config/database.js"
import { Profile } from "passport-google-oauth20"
import { GoogleUserDTO } from "@/modules/auth/dto/google-user.dto.js"

class AuthService {
  async loginWithGoogle(profile: Profile) {
    const googleUser = new GoogleUserDTO(profile)

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.googleId },
          { email: googleUser.email }
        ]
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar
        }
      })
    }

    return user
  }

  async logout(req: any) {
    return new Promise((resolve, reject) => {
      req.logout((err: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  }
}

export default new AuthService()