import { Profile } from "passport-google-oauth20"

export class GoogleUserDTO {
  readonly googleId: string
  readonly email: string
  readonly name: string
  readonly avatar?: string

  constructor(profile: Profile) {
    this.googleId = profile.id

    const email = profile.emails?.[0]?.value
    if (!email) {
      throw new Error(`Google profile missing email for googleId: ${profile.id}`)
    }
    this.email = email

    this.name = profile.displayName

    this.avatar = profile.photos?.[0]?.value
  }
}