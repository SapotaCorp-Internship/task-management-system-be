export class GoogleUserDTO {
  googleId: string
  email: string
  name: string
  avatar?: string

  constructor(profile: any) {
    this.googleId = profile.id
    this.email = profile.emails?.[0]?.value
    this.name = profile.displayName
    this.avatar = profile.photos?.[0]?.value
  }
}