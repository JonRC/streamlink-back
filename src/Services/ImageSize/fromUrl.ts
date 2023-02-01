import axios from 'axios'
import imageSizeOf from 'image-size'

export const fromUrl = async (
  url: string
): Promise<{ width: number; height: number }> => {
  const { data: imageBuffer } = await axios({
    method: 'get',
    responseType: 'arraybuffer',
    url
  })

  const { height, width } = imageSizeOf(imageBuffer)

  if (!height || !width) throw new Error('Could not get image size')

  return { height, width }
}
