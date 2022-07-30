/* eslint no-unused-vars: "off" */

declare namespace NodeJS {
  interface Process {
    env: {
      DISNEY_USERNAME: string
      DISNEY_PASSWORD: string
      NETFLIX_USERNAME: string
      NETFLIX_PASSWORD: string
      PORT?: string | undefined
    }
  }
}
