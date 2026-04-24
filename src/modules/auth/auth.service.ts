import prisma from "@/config/database.js"
import { Profile } from "passport-google-oauth20"
import { GoogleUserDTO } from "@/modules/auth/google-user.dto.js"
import { User } from "@prisma/client"

class AuthService {
  async loginWithGoogle(profile: Profile): Promise<User> {
    const googleUser = new GoogleUserDTO(profile)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.googleId },
          { email: googleUser.email },
        ],
      },
    })

    if (!existingUser) {
      return prisma.user.create({
        data: {
          googleId: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar ?? null,
        },
      })
    }

    if (!existingUser.googleId) {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: googleUser.googleId,
          avatar: existingUser.avatar ?? googleUser.avatar ?? null,
        },
      })
    }

    return existingUser
  }
}

export default new AuthService()