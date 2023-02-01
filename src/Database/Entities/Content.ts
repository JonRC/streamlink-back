export type Content = {
  id: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  description?: string
  title: string
  url: string
  provider: Provider
}

export type Provider = 'netflix' | 'prime' | 'globoplay' | 'hbo' | 'disney'
